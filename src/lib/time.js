/** Locale-aware time, date and greeting helpers. */

const formatterCache = new Map();

function getFormatter(options) {
  const key = JSON.stringify(options);
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(undefined, options));
  }
  return formatterCache.get(key);
}

/** Hour/minute parts for the big clock, with the 12-hour period kept separate. */
export function getClockParts(date, clockFormat = '12h') {
  const hour12 = clockFormat !== '24h';
  const parts = getFormatter({ hour: 'numeric', minute: '2-digit', hour12 }).formatToParts(date);
  const pick = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    hours: pick('hour'),
    minutes: pick('minute'),
    dayPeriod: hour12 ? pick('dayPeriod') : '',
  };
}

/** "Friday, November 13" — the year is omitted on purpose for a daily page. */
export function formatDate(date) {
  return getFormatter({ weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

export function getTimeZoneLabel() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  return zone.split('/').pop()?.replace(/_/g, ' ') ?? '';
}

/** Compact "when" label for notes: just now, 12m ago, 3h ago, yesterday, Nov 3. */
export function formatRelative(timestamp, now = Date.now()) {
  if (!Number.isFinite(timestamp)) return '';
  const diff = Math.max(0, now - timestamp);
  const minute = 60_000;
  const hour = 3_600_000;
  const day = 86_400_000;

  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 2 * day) return 'yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return getFormatter({ month: 'short', day: 'numeric' }).format(new Date(timestamp));
}
