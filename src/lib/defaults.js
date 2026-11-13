/**
 * Canonical defaults, limits and option lists for Luma New Tab.
 *
 * This module is intentionally free of React and browser APIs so it can be
 * imported by the dashboard, the extension entry points and the unit tests.
 */

export const STORAGE_KEY = 'luma.dashboard.v1';
export const STATE_VERSION = 1;

/** Widget ids in default order. `widgets/registry.jsx` maps each to a component. */
export const WIDGET_IDS = ['clock', 'greeting', 'search', 'shortcuts', 'notes', 'tasks'];

export const THEMES = ['system', 'light', 'dark'];
export const CLOCK_FORMATS = ['12h', '24h'];

/**
 * Search providers. `%s` is replaced with the encoded query.
 * Adding an engine here is enough for it to appear in settings.
 */
export const SEARCH_ENGINES = [
  { id: 'duckduckgo', label: 'DuckDuckGo', searchUrl: 'https://duckduckgo.com/?q=%s' },
  { id: 'google', label: 'Google', searchUrl: 'https://www.google.com/search?q=%s' },
  { id: 'bing', label: 'Bing', searchUrl: 'https://www.bing.com/search?q=%s' },
  { id: 'brave', label: 'Brave Search', searchUrl: 'https://search.brave.com/search?q=%s' },
];

/** Soft ceilings that keep a single storage record comfortably small. */
export const LIMITS = {
  shortcuts: 60,
  notes: 200,
  tasks: 500,
  shortcutLabel: 60,
  shortcutUrl: 2048,
  task: 300,
  note: 5000,
  displayName: 40,
};

export const DEFAULT_SETTINGS = Object.freeze({
  theme: 'system',
  clockFormat: '12h',
  searchEngine: 'duckduckgo',
  displayName: '',
});

/** A fresh, fully valid dashboard state. Always build defaults through this. */
export function createDefaultState() {
  return {
    version: STATE_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    layout: { order: [...WIDGET_IDS], hidden: [] },
    shortcuts: [],
    notes: [],
    tasks: [],
  };
}
