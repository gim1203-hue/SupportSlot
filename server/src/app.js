import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import { Booking, Service } from './models.js';
import { slotsForDate } from './services/scheduling.js';
import { recommend } from './services/recommendation.js';
export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());
// All browser writes must use JSON. Cross-origin form submissions are rejected.
// Deploy frontend and API together; no permissive CORS middleware is needed.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !req.is('application/json')) return res.status(415).json({ error: 'Use application/json.' });
  next();
});
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.get('/api/services', async (req, res) => res.json(await Service.find().sort({ price: 1 })));
app.get('/api/slots', async (req, res) => {
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(req.query.date);
  const slots = slotsForDate(date);
  const reserved = await Booking.find({ startsAt: { $in: slots }, status: { $in: ['confirmed', 'completed'] } }).select('startsAt');
  const taken = new Set(reserved.map(b => b.startsAt.toISOString()));
  res.json(slots.map(s => s.toISOString()).filter(s => !taken.has(s)));
});
app.post('/api/recommend', rateLimit({ windowMs: 60000, limit: 6, message: { error: 'Please wait a minute before asking again.' } }), async (req, res) => {
  const { issue } = z.object({ issue: z.string().trim().min(15).max(2000) }).parse(req.body);
  res.json(await recommend(issue, await Service.find()));
});
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
const dist = fileURLToPath(new URL('../../client/dist/', import.meta.url));
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('/{*path}', (req, res) => res.sendFile(dist + '/index.html'));
}
app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') });
  if (err.code === 11000) return res.status(409).json({ error: err.keyPattern?.email ? 'That email is already registered.' : 'That appointment was just taken. Please choose another slot.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
  console.error(err.name, err.message);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});
