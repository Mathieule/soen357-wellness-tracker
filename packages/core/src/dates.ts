/** Small date helpers. All dates are local, formatted as yyyy-mm-dd. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "Mon, Nov 10" */
export function formatDay(iso: string): string {
  return fromISODate(iso).toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** "Monday, November 10" */
export function formatLongDay(iso: string): string {
  return fromISODate(iso).toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** 452 -> "7 h 32 min" */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Minutes between two HH:MM times, crossing midnight if needed. */
export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Monday-based weekday index: Monday = 0 … Sunday = 6. */
export function weekdayIndex(iso: string): number {
  return (fromISODate(iso).getDay() + 6) % 7;
}

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Monday of the week containing `iso`. */
export function weekStart(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

/** "Today", "Yesterday" or "Mon, Nov 9". */
export function relativeDay(iso: string, ref = today()): string {
  if (iso === ref) return 'Today';
  if (iso === addDays(ref, -1)) return 'Yesterday';
  return formatDay(iso);
}

/** "06:45" -> minutes since midnight */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
