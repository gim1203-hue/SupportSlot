import mongoose from 'mongoose';
import { app } from './app.js';
import { Booking, User, Service } from './models.js';
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Copy server/.env.example to server/.env.');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('replace-with')) throw new Error('Set JWT_SECRET to a unique random string of at least 32 characters.');
await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([Booking.init(), User.init(), Service.init()]);
const server = app.listen(process.env.PORT || 4000, () => console.log(`SupportSlot API: http://localhost:${process.env.PORT || 4000}`));
async function stop() { server.close(async () => { await mongoose.disconnect(); process.exit(0); }); }
process.on('SIGTERM', stop); process.on('SIGINT', stop);
