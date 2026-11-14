export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const body = await response.json().catch(() => ({ error: 'Server returned an unexpected response.' }));
  if (!response.ok) throw new Error(body.error || 'Request failed.');
  return body;
}
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const formatTime = value => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value)) + ' UTC';
