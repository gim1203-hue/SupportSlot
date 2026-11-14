import { useState } from 'react';
import { post } from '../api.js';
export default function AuthForm({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try { onLogin(await post(`/auth/${register ? 'register' : 'login'}`, data)); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="panel auth"><span className="eyebrow">YOUR SUPPORT, IN ONE PLACE</span><h1>{register ? 'Make yourself at home.' : 'Welcome back.'}</h1><p>Manage appointments and get your tech back on track.</p>
    <form onSubmit={submit}>
      {register && <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={80}/></label>}
      <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
      <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={10} maxLength={72} required/></label>
      <small>Use 10–72 characters.</small>
      {error && <p role="alert" className="error">{error}</p>}
      <button disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    </form><button className="text-button" onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
  </section>;
}
