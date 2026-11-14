import { useEffect, useState } from 'react';
import { api, formatTime } from '../api.js';
export default function Dashboard({ user }) {
  const [bookings, setBookings] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState('');
  async function load() { try { setBookings(await api('/bookings')); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function action(id, type) {
    setBusy(id); setError('');
    try { await api(`/bookings/${id}/${type}`, { method: 'PATCH', body: '{}' }); await load(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  }
  return <section><span className="eyebrow">{user.role === 'admin' ? 'SERVICE OPERATIONS' : 'YOUR APPOINTMENTS'}</span><h1>{user.role === 'admin' ? 'The support desk.' : `You’re in good hands, ${user.name.split(' ')[0]}.`}</h1><p>Review appointment details and manage your support sessions.</p>{error && <p role="alert" className="error">{error}</p>}{loading ? <p role="status">Loading appointments…</p> : bookings.length === 0 ? <div className="panel"><h2>A little peace of mind starts here.</h2><p>Your appointments will appear here after you book a service.</p></div> : <div className="booking-list">{bookings.map(b => <article className="panel" key={b._id}><div className="section-heading"><h3>{b.service?.name || 'Service unavailable'}</h3><span className={`tag ${b.status}`}>{b.status}</span></div><p>{formatTime(b.startsAt)}</p>{user.role === 'admin' && <p>{b.user?.name} · {b.user?.email}</p>}{b.notes && <p className="notes">{b.notes}</p>}{b.status === 'confirmed' && new Date(b.startsAt) > new Date() && <button className="secondary" disabled={busy === b._id} onClick={() => action(b._id, 'cancel')}>Cancel appointment</button>}{user.role === 'admin' && b.status === 'confirmed' && new Date(b.startsAt) <= new Date() && <button disabled={busy === b._id} onClick={() => action(b._id, 'complete')}>Mark completed</button>}</article>)}</div>}</section>;
}
