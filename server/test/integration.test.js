import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../src/app.js';
import { Service, Booking, User } from '../src/models.js';
import { catalog } from '../src/catalog.js';
import { slotsForDate } from '../src/services/scheduling.js';
import { recommend } from '../src/services/recommendation.js';
let mongo, service, slot;
const alice = request.agent(app), bob = request.agent(app);
before(async () => {
  process.env.JWT_SECRET = 'test-only-secret-with-more-than-thirty-two-characters';
  process.env.NODE_ENV = 'test';
  delete process.env.AI_API_KEY;
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([User.init(), Booking.init(), Service.init()]);
  [service] = await Service.insertMany(catalog);
  for (let days = 1; days < 7; days++) {
    const date = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
    if (slotsForDate(date).length) { slot = slotsForDate(date)[0].toISOString(); break; }
  }
  await alice.post('/api/auth/register').send({ name: 'Alice Test', email: 'alice@example.com', password: 'test-password-123' }).expect(201);
  await bob.post('/api/auth/register').send({ name: 'Bob Test', email: 'bob@example.com', password: 'test-password-123' }).expect(201);
});
after(async () => { await mongoose.disconnect(); await mongo?.stop(); });
test('anonymous users cannot book; registration cannot set an admin role', async () => {
  await request(app).post('/api/bookings').send({}).expect(401);
  const agent = request.agent(app);
  const result = await agent.post('/api/auth/register').send({ name: 'Mallory', email: 'mallory@example.com', password: 'test-password-123', role: 'admin' }).expect(201);
  assert.equal(result.body.role, 'customer');
});
test('concurrent booking requests allow exactly one reservation, enforce ownership and release cancellation', async () => {
  const payload = { serviceId: service.id, startsAt: slot, notes: 'Wi-Fi problem' };
  const attempts = await Promise.all([alice.post('/api/bookings').send(payload), bob.post('/api/bookings').send(payload)]);
  assert.deepEqual(attempts.map(a => a.status).sort(), [201, 409]);
  const winnerIndex = attempts.findIndex(a => a.status === 201);
  const owner = winnerIndex === 0 ? alice : bob;
  const other = winnerIndex === 0 ? bob : alice;
  const id = attempts[winnerIndex].body._id;
  await other.patch(`/api/bookings/${id}/cancel`).send({}).expect(404);
  assert.equal((await other.get('/api/bookings')).body.length, 0);
  const available = await request(app).get(`/api/slots?date=${slot.slice(0, 10)}`);
  assert.ok(!available.body.includes(slot));
  await owner.patch(`/api/bookings/${id}/complete`).send({}).expect(403);
  await owner.patch(`/api/bookings/${id}/cancel`).send({}).expect(200);
  await other.post('/api/bookings').send(payload).expect(201);
});
test('invalid dates, off-grid times, and wrong passwords are rejected', async () => {
  await alice.post('/api/bookings').send({ serviceId: service.id, startsAt: slot.replace(':00:00.', ':30:00.') }).expect(400);
  await alice.post('/api/bookings').send({ serviceId: 'invalid', startsAt: slot }).expect(400);
  await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'wrong-password' }).expect(401);
  await request(app).post('/api/auth/logout').type('form').send({}).expect(415);
});
test('admin can view bookings and complete a started appointment', async () => {
  await User.updateOne({ email: 'alice@example.com' }, { role: 'admin' });
  const past = await Booking.create({ user: (await User.findOne({ email: 'bob@example.com' })).id, service: service.id, startsAt: new Date(Date.now() - 86400000) });
  const response = await alice.get('/api/bookings').expect(200);
  assert.ok(response.body.length >= 2);
  await alice.patch(`/api/bookings/${past.id}/complete`).send({}).expect(200);
  assert.equal((await Booking.findById(past.id)).status, 'completed');
});
test('AI fallback is labeled and unrelated requests have no service', async () => {
  const services = await Service.find();
  const result = await recommend('My wifi router drops the internet connection', services);
  assert.equal(result.mode, 'keyword-fallback');
  assert.equal(result.service.slug, 'network');
  assert.equal((await recommend('Please bake a birthday cake', services)).service, null);
});
test('AI output is grounded and invalid provider choices trigger fallback', async () => {
  const original = globalThis.fetch;
  process.env.AI_API_KEY = 'test'; process.env.AI_CHAT_URL = 'https://example.invalid'; process.env.AI_MODEL = 'test';
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ serviceId: 'invented', reason: 'Wrong', summary: 'Wrong' }) } }] }) });
    const result = await recommend('My wifi router is broken', await Service.find());
    assert.equal(result.mode, 'keyword-fallback');
    assert.ok(result.notice);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ serviceId: service.id, reason: 'Router help', summary: 'Wi-Fi drops' }) } }] }) });
    assert.equal((await recommend('My wifi router is broken', await Service.find())).mode, 'ai');
  } finally { globalThis.fetch = original; delete process.env.AI_API_KEY; }
});
