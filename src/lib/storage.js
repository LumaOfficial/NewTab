/**
 * Persistence layer.
 *
 * In the packaged extension this uses `chrome.storage.local` (survives browser
 * restarts, never leaves the device). When the dashboard is opened as a plain
 * web page — the dev preview, or `vite preview` — it falls back to
 * `localStorage` so the same UI can be developed and verified.
 */

import { STORAGE_KEY } from './defaults.js';

const extensionStorage = typeof chrome !== 'undefined' ? chrome.storage?.local : undefined;

export const STORAGE_MODE = extensionStorage ? 'extension' : 'browser';
export const STORAGE_LABEL = extensionStorage ? 'Extension storage (this browser)' : 'Browser local storage (preview)';

function chromeGet(key) {
  return new Promise((resolve, reject) => {
    extensionStorage.get(key, (result) => {
      const error = chrome.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve(result?.[key] ?? null);
    });
  });
}

function chromeSet(key, value) {
  return new Promise((resolve, reject) => {
    extensionStorage.set({ [key]: value }, () => {
      const error = chrome.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
}

function chromeRemove(key) {
  return new Promise((resolve, reject) => {
    extensionStorage.remove(key, () => {
      const error = chrome.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
}

export async function readDashboard() {
  if (extensionStorage) return (await chromeGet(STORAGE_KEY)) ?? null;

  let raw;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error('Browser storage is unavailable in this context.');
  }
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Saved dashboard data could not be read.');
  }
}

export async function writeDashboard(state) {
  if (extensionStorage) return chromeSet(STORAGE_KEY, state);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    throw new Error(`Could not save to browser storage (${error?.name ?? 'error'}).`);
  }
}

export async function clearDashboard() {
  if (extensionStorage) return chromeRemove(STORAGE_KEY);
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    throw new Error('Browser storage is unavailable in this context.');
  }
}

/** Human-friendly wording for storage failures shown in the UI. */
export function describeStorageError(error) {
  const message = error?.message || 'Unknown storage error.';
  if (/quota|exceeded/i.test(message)) {
    return 'Storage is full. Remove a few notes or tasks, then save again.';
  }
  return message;
}
