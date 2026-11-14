import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Service, User } from './models.js';
import { catalog } from './catalog.js';
if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI first.');
await mongoose.connect(process.env.MONGODB_URI);
try {
  for (const service of catalog) await Service.updateOne({ slug: service.slug }, { $set: service }, { upsert: true });
  await Promise.all([User.init(), Service.init()]);
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 10 || process.env.ADMIN_PASSWORD.length > 72) throw new Error('Admin password must have 10-72 characters.');
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    if (await User.exists({ email })) console.log('Existing user unchanged; seed will not promote or overwrite accounts.');
    else await User.create({ name: 'SupportSlot Admin', email, passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin' });
  }
  console.log('Service catalog ready. Existing bookings and users preserved.');
} finally { await mongoose.disconnect(); }
