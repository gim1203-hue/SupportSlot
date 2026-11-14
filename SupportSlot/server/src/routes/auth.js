import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { User } from '../models.js';
import { auth, publicUser, setSession } from '../middleware/auth.js';
const router = Router();
const credentials = z.object({ email: z.email().max(254).transform(v => v.toLowerCase()), password: z.string().min(10).max(72) });
router.use(rateLimit({ windowMs: 15 * 60000, limit: 40, message: { error: 'Too many attempts. Try again later.' } }));
router.post('/register', async (req, res) => {
  const data = credentials.extend({ name: z.string().trim().min(2).max(80) }).parse(req.body);
  const user = await User.create({ name: data.name, email: data.email, passwordHash: await bcrypt.hash(data.password, 12) });
  setSession(res, user); res.status(201).json(publicUser(user));
});
router.post('/login', async (req, res) => {
  const data = credentials.parse(req.body);
  const user = await User.findOne({ email: data.email }).select('+passwordHash');
  if (!user || !await bcrypt.compare(data.password, user.passwordHash)) return res.status(401).json({ error: 'Email or password is incorrect.' });
  setSession(res, user); res.json(publicUser(user));
});
router.get('/me', auth, (req, res) => res.json(publicUser(req.user)));
router.post('/logout', (req, res) => { res.clearCookie('session', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' }); res.json({ ok: true }); });
export default router;
