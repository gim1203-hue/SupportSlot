import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
}, { timestamps: true });
const serviceSchema = new Schema({
  slug: { type: String, unique: true, required: true }, name: String,
  category: String, description: String, price: Number,
  duration: { type: Number, default: 60 }, keywords: [String]
});
const bookingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  startsAt: { type: Date, required: true },
  notes: { type: String, maxlength: 2000 },
  status: { type: String, enum: ['confirmed', 'completed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });
// One technician, one-hour appointments. Completed appointments stay reserved.
bookingSchema.index({ startsAt: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['confirmed', 'completed'] } } });
export const User = model('User', userSchema);
export const Service = model('Service', serviceSchema);
export const Booking = model('Booking', bookingSchema);
