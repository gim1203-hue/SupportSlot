export function slotsForDate(date, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const day = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== date) return [];
  if ([0, 6].includes(day.getUTCDay())) return [];
  // UTC is explicit throughout the demo; no hidden browser/server timezone conversion.
  return [13, 14, 15, 16, 17, 18, 19, 20].map(hour => new Date(`${date}T${hour}:00:00.000Z`))
    .filter(slot => slot > now && slot.getTime() < now.getTime() + 30 * 86400000);
}
export function validSlot(iso) {
  const date = new Date(iso);
  return !Number.isNaN(date.getTime()) && slotsForDate(date.toISOString().slice(0, 10)).some(slot => slot.getTime() === date.getTime());
}
