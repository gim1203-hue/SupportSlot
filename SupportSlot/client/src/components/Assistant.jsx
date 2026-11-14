import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { post } from '../api.js';
export default function Assistant({ onSelect }) {
  const [issue, setIssue] = useState(''); const [result, setResult] = useState(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(''); setResult(null);
    try { setResult(await post('/recommend', { issue })); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="assistant panel" id="assistant"><div><span className="eyebrow"><Sparkles size={15}/> SMART SERVICE FINDER</span><h2>Tell us what’s going wrong.</h2><p>No technical vocabulary needed. Describe the problem and we’ll help you find a service.</p><small>AI suggestions need your review. Without an AI provider, this uses a clearly labeled keyword matcher. Your description is sent to the configured AI provider when enabled. Do not include secrets.</small></div><div>
    <form onSubmit={submit}><label className="sr-only" htmlFor="issue">Describe your IT issue</label><textarea id="issue" placeholder="My laptop keeps disconnecting from Wi-Fi during video calls…" value={issue} onChange={e => setIssue(e.target.value)} minLength={15} maxLength={2000} required rows={4}/><button disabled={busy}>{busy ? 'Finding a service…' : <>Find my service <ArrowRight size={17}/></>}</button></form>
    {error && <p role="alert" className="error">{error}</p>}
    {result && <div className="result" role="status"><span className="tag">{result.mode === 'ai' ? 'AI recommendation' : 'Keyword fallback · not AI'}</span>{result.notice && <p>{result.notice}</p>}<h3>{result.service?.name || 'Let’s find the right help'}</h3><p>{result.reason}</p><p><strong>Intake summary:</strong> {result.summary}</p>{result.service && <button className="secondary" onClick={() => onSelect(result.service, result.summary)}>Review & book</button>}</div>}
  </div></section>;
}
