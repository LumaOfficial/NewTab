/**
 * Search bar behavior: a typed value is either treated as a web address
 * (typing `example.com` should go there) or as a search query.
 */

import { SEARCH_ENGINES } from './defaults.js';
import { normalizeShortcutUrl } from './url.js';

const HAS_HTTP_SCHEME = /^https?:\/\//i;
const HOST_LIKE = /^(?:localhost|\d{1,3}(?:\.\d{1,3}){3}|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?:[/?#]|$)/i;

export function getSearchEngine(id) {
  return SEARCH_ENGINES.find((engine) => engine.id === id) ?? SEARCH_ENGINES[0];
}

/**
 * Resolves the value of the search field to a URL to open.
 * Returns null for an empty query so the caller can simply keep focus.
 */
export function buildSearchUrl(query, engineId) {
  const trimmed = String(query ?? '').trim();
  if (!trimmed) return null;

  if (HAS_HTTP_SCHEME.test(trimmed) || HOST_LIKE.test(trimmed)) {
    const direct = normalizeShortcutUrl(trimmed);
    if (direct) return direct;
  }

  return getSearchEngine(engineId).searchUrl.replace('%s', encodeURIComponent(trimmed));
}
