/**
 * Extension environment helpers.
 *
 * The same bundle runs inside the extension (`chrome.*` APIs available) and as
 * a plain web page during development, so feature code asks these helpers
 * instead of probing globals itself.
 */

export const APP_NAME = 'Luma New Tab';
export const APP_VERSION = '0.1.0';

interface ChromeRuntimeLike {
  storage?: { local?: unknown };
}

export function isExtensionContext(): boolean {
  const chrome = (globalThis as { chrome?: ChromeRuntimeLike }).chrome;
  return Boolean(chrome?.storage?.local);
}

/** Where the dashboard data lives, phrased for the settings UI. */
export function storageLocationLabel(kind: 'extension' | 'browser' | 'unavailable'): string {
  switch (kind) {
    case 'extension':
      return 'Browser extension storage (chrome.storage.local)';
    case 'browser':
      return 'This browser’s local storage (preview mode)';
    default:
      return 'Unavailable — changes last only for this session';
  }
}
