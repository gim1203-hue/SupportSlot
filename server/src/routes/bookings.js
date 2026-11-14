import { Router } from 'express';
import { z } from 'zod';
import { Booking, Service } from '../models.js';
import { auth, admin } from '../middleware/auth.js';
import { validSlot } from '../services/scheduling.js';
const router = Router();
const id = z.string().regex(/^[a-f0-9]{24}$/i);
router.use(auth);
router.get('/', async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
  res.json(await Booking.find(filter).populate('service').populate('user', 'name email').sort({ startsAt: 1 }));
});
router.post('/', async (req, res) => {
  const data = z.object({ serviceId: id, startsAt: z.iso.datetime(), notes: z.string().trim().max(2000).default('') }).parse(req.body);
  if (!validSlot(data.startsAt)) return res.status(400).json({ error: 'Choose an available weekday slot within the next 30 days.' });
  if (!await Service.exists({ _id: data.serviceId })) return res.status(404).json({ error: 'Service not found.' });
  const booking = await Booking.create({ user: req.user.id, service: data.serviceId, startsAt: data.startsAt, notes: data.notes });
  res.status(201).json(await booking.populate('service'));
});
router.patch('/:id/cancel', async (req, res) => {
  const filter = { _id: id.parse(req.params.id), status: 'confirmed', startsAt: { $gt: new Date() } };
  if (req.user.role !== 'admin') filter.user = req.user.id;
  const booking = await Booking.findOneAndUpdate(filter, { status: 'cancelled' }, { new: true });
  if (!booking) return res.status(404).json({ error: 'An upcoming confirmed booking was not found.' });
  res.json(booking);
});
router.patch('/:id/complete', admin, async (req, res) => {
  const booking = await Booking.findOneAndUpdate({ _id: id.parse(req.params.id), status: 'confirmed', startsAt: { $lte: new Date() } }, { status: 'completed' }, { new: true });
  if (!booking) return res.status(400).json({ error: 'Only confirmed appointments that have started can be completed.' });
  res.json(booking);
});
export default router;
