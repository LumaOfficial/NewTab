import type { SearchEngineId } from '../storage/schema';

export interface SearchEngine {
  id: SearchEngineId;
  label: string;
  /** `%s` is replaced with the encoded query. */
  urlTemplate: string;
}

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    label: 'Google',
    urlTemplate: 'https://www.google.com/search?q=%s',
  },
  {
    id: 'duckduckgo',
    label: 'DuckDuckGo',
    urlTemplate: 'https://duckduckgo.com/?q=%s',
  },
  {
    id: 'bing',
    label: 'Bing',
    urlTemplate: 'https://www.bing.com/search?q=%s',
  },
  {
    id: 'startpage',
    label: 'Startpage',
    urlTemplate: 'https://www.startpage.com/sp/search?query=%s',
  },
  {
    id: 'custom',
    label: 'Custom engine',
    urlTemplate: '',
  },
];

export function getSearchEngine(engineId: SearchEngineId): SearchEngine {
  return SEARCH_ENGINES.find((engine) => engine.id === engineId) ?? SEARCH_ENGINES[0];
}

/**
 * A custom engine URL may contain `%s`; without it the query is appended as
 * `?q=`. Only http(s) URLs are accepted, so a bad value can never navigate to
 * a script or file address.
 */
export function resolveSearchTemplate(engineId: SearchEngineId, customUrl: string): string {
  if (engineId !== 'custom') return getSearchEngine(engineId).urlTemplate;

  try {
    const url = new URL(customUrl.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return customUrl.includes('%s') ? customUrl.trim() : `${url.toString()}${url.search ? '&' : '?'}q=%s`;
  } catch {
    return '';
  }
}

export function searchUrlFor(engineId: SearchEngineId, query: string, customUrl = ''): string {
  const template = resolveSearchTemplate(engineId, customUrl);
  const encoded = encodeURIComponent(query.trim());
  if (!template) {
    return `https://duckduckgo.com/?q=${encoded}`;
  }
  return template.replace('%s', encoded);
}
