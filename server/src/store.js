/**
 * Tiny JSON file store.
 *
 * The account service is deliberately dependency-light: one file, atomic
 * writes, and a snapshot taken at save time. It is the only place that touches
 * the disk, so swapping in a real database later means replacing this module.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from './config.js';

function emptyState() {
  return {
    users: [],
    sessions: [],
    verification: {},
    resets: {},
    sync: {},
    integrations: {},
    oauthStates: {},
  };
}

let state = emptyState();
let loaded = false;
let writeChain = Promise.resolve();

export function dataFile() {
  return join(config.dataDir, 'luma-account-data.json');
}

export async function load() {
  await mkdir(config.dataDir, { recursive: true });
  try {
    const raw = await readFile(dataFile(), 'utf8');
    const parsed = JSON.parse(raw);
    state = { ...emptyState(), ...parsed };
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('[luma] could not read the data file, starting empty:', error.message);
    }
  }
  loaded = true;
}

export function db() {
  if (!loaded) throw new Error('Store not loaded yet.');
  return state;
}

/** Persist the current state; calls are serialised so writes never interleave. */
export function save() {
  const snapshot = JSON.stringify(state);
  writeChain = writeChain
    .then(async () => {
      const temporary = `${dataFile()}.tmp`;
      await writeFile(temporary, snapshot, 'utf8');
      await rename(temporary, dataFile());
    })
    .catch((error) => console.error('[luma] could not save data:', error.message));
  return writeChain;
}
