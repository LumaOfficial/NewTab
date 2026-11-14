import type { ClockFormat } from '../storage/schema';

/** Time-aware greeting used by the greeting widget. */
export function greetingForHour(hour: number): string {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export function formatClockTime(date: Date, format: ClockFormat): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  }).format(date);
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatShortDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(timestamp),
  );
}

/** Compact "when was this edited" label for notes. */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const minutes = Math.round((now - timestamp) / 60000);

  if (minutes < 1) return 'Edited just now';
  if (minutes < 60) return `Edited ${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Edited ${hours} h ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return 'Edited yesterday';
  if (days < 7) return `Edited ${days} days ago`;

  return `Edited ${formatShortDate(timestamp)}`;
}

export interface UrlResult {
  url?: string;
  error?: string;
}

/**
 * Accepts what people actually type (`example.com`, `https://…`) and rejects
 * anything that is not a plain web address.
 */
export function normalizeShortcutUrl(raw: string): UrlResult {
  const value = raw.trim();
  if (!value) return { error: 'Enter a website address.' };

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { error: 'That doesn’t look like a valid web address.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'Only http and https links are supported.' };
  }

  if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
    return { error: 'Add a full domain, for example example.com.' };
  }

  return { url: parsed.toString() };
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function monogramFor(title: string, url = ''): string {
  const source = title.trim() || hostnameOf(url);
  const match = source.match(/[a-z0-9]/i);
  return (match?.[0] ?? '•').toUpperCase();
}

/**
 * Stable hue per shortcut. Picked from a small on-brand set (violet, lilac,
 * indigo, teal, amber, rose) so tiles stay distinct without fighting the theme.
 */
const MONOGRAM_HUES = [258, 286, 214, 190, 26, 340];

export function hueFor(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return MONOGRAM_HUES[hash % MONOGRAM_HUES.length];
}
