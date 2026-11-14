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
];

export function getSearchEngine(engineId: SearchEngineId): SearchEngine {
  return SEARCH_ENGINES.find((engine) => engine.id === engineId) ?? SEARCH_ENGINES[0];
}

export function searchUrlFor(engineId: SearchEngineId, query: string): string {
  return getSearchEngine(engineId).urlTemplate.replace('%s', encodeURIComponent(query.trim()));
}
