/**
 * URL helpers shared by the shortcut forms and the search bar.
 * Only http(s) addresses are accepted, which keeps stored shortcuts safe to
 * render as plain links.
 */

import { LIMITS } from './defaults.js';

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const HOST_LIKE = /^(?:localhost|\d{1,3}(?:\.\d{1,3}){3}|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?:[/?#]|$)/i;

export function isWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Accepts `example.com`, `www.example.com/path`, `https://example.com`.
 * Returns an absolute, normalized URL or null when the input is not a web address.
 */
export function normalizeShortcutUrl(input) {
  if (typeof input !== 'string') return null;
  const value = input.trim();
  if (!value || value.length > LIMITS.shortcutUrl) return null;

  const candidate = HAS_SCHEME.test(value) ? value : HOST_LIKE.test(value) ? `https://${value}` : null;
  if (!candidate || !isWebUrl(candidate)) return null;

  return new URL(candidate).toString();
}

/** A friendly default label for a shortcut: the host without `www.`. */
export function hostnameLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return 'Link';
  }
}
