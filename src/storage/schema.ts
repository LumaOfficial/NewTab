import { createId } from '../lib/utils';
import { WIDGET_IDS, type WidgetId } from '../widgets/widgets';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ClockFormat = '12h' | '24h';
export type SearchEngineId = 'google' | 'duckduckgo' | 'bing' | 'startpage';

export interface DashboardSettings {
  theme: ThemePreference;
  clockFormat: ClockFormat;
  displayName: string;
  searchEngine: SearchEngineId;
  searchInNewTab: boolean;
  /** Order used to lay widgets out; always contains every known widget id. */
  widgetOrder: WidgetId[];
  /** Widgets the user has hidden. */
  hiddenWidgets: WidgetId[];
}

export interface Shortcut {
  id: string;
  title: string;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export type TrashKind = 'note' | 'task' | 'shortcut';

/**
 * Deleted notes, tasks and shortcuts land here first, so an accidental delete
 * can be undone without a sync round trip.
 */
export interface TrashEntry {
  id: string;
  kind: TrashKind;
  itemId: string;
  label: string;
  deletedAt: number;
  item: Note | Task | Shortcut;
}

/** The whole dashboard state, persisted as a single versioned record. */
export interface DashboardData {
  settings: DashboardSettings;
  shortcuts: Shortcut[];
  notes: Note[];
  tasks: Task[];
  trash: TrashEntry[];
}

export const STORAGE_KEY = 'luma.dashboard.v1';
export const DATA_VERSION = 1;

export const SEARCH_ENGINE_IDS: SearchEngineId[] = ['google', 'duckduckgo', 'bing', 'startpage'];
export const THEME_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];
export const CLOCK_FORMATS: ClockFormat[] = ['12h', '24h'];

export function createDefaultSettings(): DashboardSettings {
  return {
    theme: 'system',
    clockFormat: '12h',
    displayName: '',
    searchEngine: 'google',
    searchInNewTab: true,
    widgetOrder: [...WIDGET_IDS],
    hiddenWidgets: [],
  };
}

export function createDefaultDashboard(): DashboardData {
  return {
    settings: createDefaultSettings(),
    shortcuts: [],
    notes: [],
    tasks: [],
    trash: [],
  };
}

export const TRASH_LIMIT = 50;

/* ------------------------------------------------------------------------- *
 * Loading / validation
 *
 * Storage can hold older shapes, hand-edited data or partial writes, so every
 * read is validated field by field and falls back to a default instead of
 * throwing.
 * ------------------------------------------------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readTimestamp(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : Date.now();
}

function isWidgetId(value: unknown): value is WidgetId {
  return typeof value === 'string' && (WIDGET_IDS as readonly string[]).includes(value);
}

/** Keeps valid ids, drops duplicates, then appends any widget the build added since. */
export function normalizeWidgetOrder(value: unknown): WidgetId[] {
  const seen = new Set<WidgetId>();

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (isWidgetId(entry)) seen.add(entry);
    }
  }

  for (const id of WIDGET_IDS) seen.add(id);
  return Array.from(seen);
}

function readWidgetList(value: unknown): WidgetId[] {
  if (!Array.isArray(value)) return [];
  const hidden = new Set<WidgetId>();
  for (const entry of value) {
    if (isWidgetId(entry)) hidden.add(entry);
  }
  return Array.from(hidden);
}

function readShortcuts(value: unknown): Shortcut[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): Shortcut[] => {
    if (!isRecord(entry)) return [];
    const url = readString(entry.url).trim();
    if (!url) return [];

    const title = readString(entry.title).trim();
    return [
      {
        id: readString(entry.id) || createId('shortcut'),
        title: title || url,
        url,
      },
    ];
  });
}

function readNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): Note[] => {
    if (!isRecord(entry)) return [];
    const body = readString(entry.body);
    const title = readString(entry.title);
    if (!body.trim() && !title.trim()) return [];

    return [
      {
        id: readString(entry.id) || createId('note'),
        title,
        body,
        updatedAt: readTimestamp(entry.updatedAt),
      },
    ];
  });
}

function readTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): Task[] => {
    if (!isRecord(entry)) return [];
    const text = readString(entry.text).trim();
    if (!text) return [];

    return [
      {
        id: readString(entry.id) || createId('task'),
        text,
        done: readBoolean(entry.done, false),
        createdAt: readTimestamp(entry.createdAt),
      },
    ];
  });
}

export function sanitizeSettings(value: unknown): DashboardSettings {
  const defaults = createDefaultSettings();
  if (!isRecord(value)) return defaults;

  const theme = THEME_PREFERENCES.includes(value.theme as ThemePreference)
    ? (value.theme as ThemePreference)
    : defaults.theme;

  const clockFormat = CLOCK_FORMATS.includes(value.clockFormat as ClockFormat)
    ? (value.clockFormat as ClockFormat)
    : defaults.clockFormat;

  const searchEngine = SEARCH_ENGINE_IDS.includes(value.searchEngine as SearchEngineId)
    ? (value.searchEngine as SearchEngineId)
    : defaults.searchEngine;

  return {
    theme,
    clockFormat,
    displayName: readString(value.displayName).slice(0, 40),
    searchEngine,
    searchInNewTab: readBoolean(value.searchInNewTab, defaults.searchInNewTab),
    widgetOrder: normalizeWidgetOrder(value.widgetOrder),
    hiddenWidgets: readWidgetList(value.hiddenWidgets),
  };
}

function readTrash(value: unknown): TrashEntry[] {
  if (!Array.isArray(value)) return [];

  const entries: TrashEntry[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const kind = entry.kind;
    if (kind !== 'note' && kind !== 'task' && kind !== 'shortcut') continue;
    if (!isRecord(entry.item)) continue;

    const item = entry.item;
    const itemId = readString(item.id);
    if (!itemId) continue;

    const normalizedItem: Note | Task | Shortcut =
      kind === 'note'
        ? {
            id: itemId,
            title: readString(item.title),
            body: readString(item.body),
            updatedAt: readTimestamp(item.updatedAt),
          }
        : kind === 'task'
          ? {
              id: itemId,
              text: readString(item.text),
              done: readBoolean(item.done, false),
              createdAt: readTimestamp(item.createdAt),
            }
          : {
              id: itemId,
              title: readString(item.title),
              url: readString(item.url),
            };

    const label =
      readString(entry.label).trim() ||
      (kind === 'task'
        ? (normalizedItem as Task).text
        : (normalizedItem as Note | Shortcut).title) ||
      'Untitled';

    entries.push({
      id: readString(entry.id) || createId('trash'),
      kind,
      itemId,
      label,
      deletedAt: readTimestamp(entry.deletedAt),
      item: normalizedItem,
    });
  }

  return entries.slice(0, TRASH_LIMIT);
}

export function sanitizeDashboard(value: unknown): DashboardData {
  if (!isRecord(value)) return createDefaultDashboard();

  return {
    settings: sanitizeSettings(value.settings),
    shortcuts: readShortcuts(value.shortcuts),
    notes: readNotes(value.notes),
    tasks: readTasks(value.tasks),
    trash: readTrash(value.trash),
  };
}
