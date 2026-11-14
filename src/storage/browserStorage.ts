/**
 * Storage adapter.
 *
 * In the extension the dashboard lives in `chrome.storage.local` (MV3, shared
 * by Opera/Chrome/Edge and available offline). When the same bundle is opened
 * as a normal web page — `npm run dev` or the Base44 preview — it falls back to
 * `localStorage`, which is close enough to exercise the real save paths.
 */

export type StorageKind = 'extension' | 'browser' | 'unavailable';

export interface KeyValueStore {
  readonly kind: StorageKind;
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}

interface ChromeStorageArea {
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

interface ChromeLike {
  storage?: { local?: ChromeStorageArea };
}

function getChromeStorageArea(): ChromeStorageArea | null {
  const chrome = (globalThis as { chrome?: ChromeLike }).chrome;
  const area = chrome?.storage?.local;
  if (!area || typeof area.get !== 'function' || typeof area.set !== 'function') return null;
  return area;
}

function getLocalStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    // Safari/incognito style guards can expose the API but throw on use.
    const probe = '__luma_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

/** Store used when nothing can persist: reads default to empty, writes fail loudly. */
function createUnavailableStore(): KeyValueStore {
  return {
    kind: 'unavailable',
    async get() {
      return null;
    },
    async set() {
      throw new Error('Browser storage is not available, so changes cannot be saved.');
    },
  };
}

export function createStore(): KeyValueStore {
  const chromeArea = getChromeStorageArea();

  if (chromeArea) {
    return {
      kind: 'extension',
      async get(key) {
        const result = await chromeArea.get(key);
        return result?.[key] ?? null;
      },
      async set(key, value) {
        await chromeArea.set({ [key]: value });
      },
    };
  }

  const local = getLocalStorage();

  if (local) {
    return {
      kind: 'browser',
      async get(key) {
        const raw = local.getItem(key);
        if (raw === null) return null;
        try {
          return JSON.parse(raw) as unknown;
        } catch {
          return null;
        }
      },
      async set(key, value) {
        local.setItem(key, JSON.stringify(value));
      },
    };
  }

  return createUnavailableStore();
}

export function describeStorageError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Browser storage rejected the change.';
}
