/**
 * Turns anything read from storage into a complete, valid dashboard state.
 *
 * Stored data can be missing, outdated or edited by hand, so every field is
 * validated here instead of being trusted by the UI. Unknown widgets, invalid
 * themes and malformed entries are dropped rather than rendering broken cards.
 */

import {
  CLOCK_FORMATS,
  LIMITS,
  SEARCH_ENGINES,
  STATE_VERSION,
  THEMES,
  WIDGET_IDS,
  createDefaultState,
} from './defaults.js';
import { createId } from './id.js';
import { hostnameLabel, normalizeShortcutUrl } from './url.js';

const THEME_SET = new Set(THEMES);
const CLOCK_SET = new Set(CLOCK_FORMATS);
const ENGINE_SET = new Set(SEARCH_ENGINES.map((engine) => engine.id));
const WIDGET_SET = new Set(WIDGET_IDS);
const ID_PATTERN = /^[a-z]{2}_[A-Za-z0-9-]{4,72}$/;

function cleanLine(value, max) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function cleanBlock(value, max) {
  return typeof value === 'string' ? value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '';
}

function cleanId(value, prefix) {
  return typeof value === 'string' && ID_PATTERN.test(value) ? value : createId(prefix);
}

function cleanTimestamp(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function normalizeShortcut(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const url = normalizeShortcutUrl(entry.url);
  if (!url) return null;

  return {
    id: cleanId(entry.id, 'sc'),
    label: cleanLine(entry.label, LIMITS.shortcutLabel) || hostnameLabel(url),
    url,
  };
}

export function normalizeNote(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const text = cleanBlock(entry.text, LIMITS.note);
  if (!text) return null;

  return {
    id: cleanId(entry.id, 'nt'),
    text,
    updatedAt: cleanTimestamp(entry.updatedAt, Date.now()),
  };
}

export function normalizeTask(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const text = cleanLine(entry.text, LIMITS.task);
  if (!text) return null;

  return {
    id: cleanId(entry.id, 'tk'),
    text,
    done: entry.done === true,
    createdAt: cleanTimestamp(entry.createdAt, Date.now()),
  };
}

export function normalizeState(raw) {
  const base = createDefaultState();
  if (!raw || typeof raw !== 'object') return base;

  const rawSettings = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};
  const settings = {
    theme: THEME_SET.has(rawSettings.theme) ? rawSettings.theme : base.settings.theme,
    clockFormat: CLOCK_SET.has(rawSettings.clockFormat) ? rawSettings.clockFormat : base.settings.clockFormat,
    searchEngine: ENGINE_SET.has(rawSettings.searchEngine) ? rawSettings.searchEngine : base.settings.searchEngine,
    displayName: cleanLine(rawSettings.displayName, LIMITS.displayName),
  };

  const rawLayout = raw.layout && typeof raw.layout === 'object' ? raw.layout : {};

  const order = [];
  if (Array.isArray(rawLayout.order)) {
    for (const id of rawLayout.order) {
      if (WIDGET_SET.has(id) && !order.includes(id)) order.push(id);
    }
  }
  for (const id of WIDGET_IDS) {
    if (!order.includes(id)) order.push(id);
  }

  const hidden = [];
  if (Array.isArray(rawLayout.hidden)) {
    for (const id of rawLayout.hidden) {
      if (WIDGET_SET.has(id) && !hidden.includes(id)) hidden.push(id);
    }
  }

  const shortcuts = Array.isArray(raw.shortcuts)
    ? raw.shortcuts.map(normalizeShortcut).filter(Boolean).slice(0, LIMITS.shortcuts)
    : [];
  const notes = Array.isArray(raw.notes) ? raw.notes.map(normalizeNote).filter(Boolean).slice(0, LIMITS.notes) : [];
  const tasks = Array.isArray(raw.tasks) ? raw.tasks.map(normalizeTask).filter(Boolean).slice(0, LIMITS.tasks) : [];

  return { version: STATE_VERSION, settings, layout: { order, hidden }, shortcuts, notes, tasks };
}
