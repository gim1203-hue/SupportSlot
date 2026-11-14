import jwt from 'jsonwebtoken';
import { User } from '../models.js';
export async function auth(req, res, next) {
  try {
    const payload = jwt.verify(req.cookies.session || '', process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = await User.findById(payload.sub);
    if (!req.user) return res.status(401).json({ error: 'Please sign in.' });
    next();
  } catch { res.status(401).json({ error: 'Please sign in.' }); }
}
export function admin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
}
export function publicUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
export function setSession(res, user) {
  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: user.id, expiresIn: '8h', algorithm: 'HS256' });
  res.cookie('session', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 3600000 });
}
