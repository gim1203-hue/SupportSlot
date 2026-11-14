import { useEffect, useState } from 'react';
import { api, post, formatTime } from '../api.js';
export default function BookingForm({ service, initialNotes = '', onBooked, onClose }) {
  const [date, setDate] = useState(''); const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState(''); const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true; setSlot(''); setSlots([]); setError('');
    if (!date) return;
    setLoading(true);
    api(`/slots?date=${date}`).then(data => { if (active) setSlots(data); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date]);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await post('/bookings', { serviceId: service._id, startsAt: slot, notes }); onBooked(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="panel booking"><div className="section-heading"><h2>Reserve your support session</h2><button className="secondary" onClick={onClose}>Close</button></div><p>{service.name} · ${service.price} · 60 minutes</p><p className="muted">Demo scheduling: Monday–Friday, 13:00–21:00 UTC. All times below are UTC. Payment is not collected.</p>
    <form onSubmit={submit}><label>Appointment date<input type="date" required value={date} min={new Date().toISOString().slice(0, 10)} max={new Date(Date.now() + 29 * 86400000).toISOString().slice(0, 10)} onChange={e => setDate(e.target.value)}/></label>
    <label>Available time<select required value={slot} onChange={e => setSlot(e.target.value)} disabled={loading}><option value="">{loading ? 'Loading…' : 'Choose a time'}</option>{slots.map(s => <option key={s} value={s}>{formatTime(s)}</option>)}</select></label>
    {date && !loading && !slots.length && <p role="status">No appointments available on this date. Try another weekday.</p>}
    <label>What should your technician know?<textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={2000} rows={3}/></label>
    <small>Review any AI-generated summary. Do not include passwords or sensitive personal information.</small>
    {error && <p role="alert" className="error">{error}</p>}<button disabled={busy || !slot}>{busy ? 'Reserving…' : 'Confirm appointment'}</button></form>
  </section>;
}
