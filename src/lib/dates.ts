/** Small, dependency-free date helpers shared by widgets. */

export function isoDay(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  return isoDay();
}

export function parseIsoDay(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function daysUntil(isoDate: string, from: Date = new Date()): number | null {
  const target = parseIsoDay(isoDate);
  if (!target) return null;
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/** `Today`, `Tomorrow`, `Yesterday`, then a short date. */
export function relativeDay(isoDate: string, from: Date = new Date()): string {
  const diff = daysUntil(isoDate, from);
  if (diff === null) return isoDate;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  const date = parseIsoDay(isoDate);
  if (!date) return isoDate;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function startOfWeek(date: Date, weekStartsOn: 0 | 1): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  result.setDate(result.getDate() - diff);
  return result;
}

export function weekNumber(date: Date): number {
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil(((copy.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function minutesToClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
}

export function lastNDays(count: number, from: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, index) => isoDay(addDays(from, index - (count - 1))));
}

export function shortWeekday(isoDate: string): string {
  const date = parseIsoDay(isoDate);
  return date ? date.toLocaleDateString(undefined, { weekday: 'short' }) : isoDate;
}
