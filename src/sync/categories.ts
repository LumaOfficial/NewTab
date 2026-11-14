/**
 * How dashboard state maps onto sync categories.
 *
 * Each category is a small, independently versioned slice, so a conflict in
 * one widget never blocks the rest of the dashboard. Every incoming payload is
 * run through `sanitizeDashboard`, so bad or older data can never break state.
 */
import {
  sanitizeDashboard,
  type ClockFormat,
  type DashboardData,
  type SearchEngineId,
  type ThemePreference,
} from '../storage/schema';
import { WIDGET_IDS } from '../widgets/catalogue';

export const SYNC_CATEGORIES = [
  {
    id: 'appearance',
    label: 'Theme',
    description: 'Light, dark or system appearance.',
  },
  {
    id: 'widgets',
    label: 'Widget layout',
    description: 'Which widgets are shown, and their order.',
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    description: 'The sites you pinned to the new tab.',
  },
  {
    id: 'notes',
    label: 'Notes',
    description: 'Every note and its last edit time.',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    description: 'Your to-do list and which items are done.',
  },
  {
    id: 'settings',
    label: 'General settings',
    description: 'Clock format, your name and search preferences.',
  },
] as const;

export type SyncCategoryId = (typeof SYNC_CATEGORIES)[number]['id'];

export const SYNC_CATEGORY_IDS = SYNC_CATEGORIES.map((entry) => entry.id);

export function defaultEnabledCategories(): Record<SyncCategoryId, boolean> {
  return Object.fromEntries(SYNC_CATEGORY_IDS.map((id) => [id, true])) as Record<
    SyncCategoryId,
    boolean
  >;
}

export function sliceCategory(data: DashboardData, id: SyncCategoryId): unknown {
  switch (id) {
    case 'appearance':
      return { theme: data.settings.theme };
    case 'widgets':
      return {
        widgetOrder: data.settings.widgetOrder,
        hiddenWidgets: data.settings.hiddenWidgets,
        layout: data.settings.layout,
      };
    case 'shortcuts':
      return data.shortcuts;
    case 'notes':
      return data.notes;
    case 'tasks':
      return data.tasks;
    case 'settings':
      return {
        clockFormat: data.settings.clockFormat,
        displayName: data.settings.displayName,
        searchEngine: data.settings.searchEngine,
        searchInNewTab: data.settings.searchInNewTab,
      };
    default:
      return null;
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function applyCategory(
  data: DashboardData,
  id: SyncCategoryId,
  payload: unknown,
): DashboardData {
  const incoming = record(payload);

  switch (id) {
    case 'appearance':
      return sanitizeDashboard({
        ...data,
        settings: {
          ...data.settings,
          theme: (incoming.theme as ThemePreference | undefined) ?? data.settings.theme,
        },
      });
    case 'widgets':
      return sanitizeDashboard({
        ...data,
        settings: {
          ...data.settings,
          widgetOrder: incoming.widgetOrder ?? data.settings.widgetOrder,
          hiddenWidgets: incoming.hiddenWidgets ?? data.settings.hiddenWidgets,
          layout: incoming.layout ?? data.settings.layout,
        },
      });
    case 'shortcuts':
      return sanitizeDashboard({ ...data, shortcuts: payload });
    case 'notes':
      return sanitizeDashboard({ ...data, notes: payload });
    case 'tasks':
      return sanitizeDashboard({ ...data, tasks: payload });
    case 'settings':
      return sanitizeDashboard({
        ...data,
        settings: {
          ...data.settings,
          clockFormat: (incoming.clockFormat as ClockFormat | undefined) ?? data.settings.clockFormat,
          displayName:
            typeof incoming.displayName === 'string' ? incoming.displayName : data.settings.displayName,
          searchEngine:
            (incoming.searchEngine as SearchEngineId | undefined) ?? data.settings.searchEngine,
          searchInNewTab:
            typeof incoming.searchInNewTab === 'boolean'
              ? incoming.searchInNewTab
              : data.settings.searchInNewTab,
        },
      });
    default:
      return data;
  }
}

/** True when this device holds something worth keeping for the category. */
export function hasLocalContent(data: DashboardData, id: SyncCategoryId): boolean {
  switch (id) {
    case 'appearance':
      return data.settings.theme !== 'system';
    case 'widgets':
      return (
        data.settings.hiddenWidgets.length > 0 ||
        data.settings.widgetOrder.join('|') !== WIDGET_IDS.join('|')
      );
    case 'shortcuts':
      return data.shortcuts.length > 0;
    case 'notes':
      return data.notes.length > 0;
    case 'tasks':
      return data.tasks.length > 0;
    case 'settings':
      return (
        data.settings.clockFormat !== '12h' ||
        data.settings.displayName.trim() !== '' ||
        data.settings.searchEngine !== 'google' ||
        data.settings.searchInNewTab !== true
      );
    default:
      return false;
  }
}

/** Short, human-readable summary used by the conflict screen. */
export function describeCategory(id: SyncCategoryId, payload: unknown): string[] {
  const value = record(payload);
  const count = (input: unknown) => (Array.isArray(input) ? input.length : 0);
  const plural = (amount: number, word: string) => `${amount} ${word}${amount === 1 ? '' : 's'}`;

  switch (id) {
    case 'appearance':
      return [`Theme: ${typeof value.theme === 'string' ? value.theme : 'system'}`];
    case 'widgets':
      return [
        `${count(value.widgetOrder)} widgets in order`,
        `${count(value.hiddenWidgets)} hidden`,
      ];
    case 'shortcuts':
      return [`${plural(count(payload), 'shortcut')}`];
    case 'notes':
      return [`${plural(count(payload), 'note')}`];
    case 'tasks': {
      const done = Array.isArray(payload)
        ? payload.filter((entry) => record(entry).done === true).length
        : 0;
      return [plural(count(payload), 'task'), `${done} completed`];
    }
    case 'settings':
      return [
        `Clock: ${typeof value.clockFormat === 'string' ? value.clockFormat : '12h'}`,
        `Name: ${typeof value.displayName === 'string' && value.displayName ? value.displayName : 'not set'}`,
        `Search: ${typeof value.searchEngine === 'string' ? value.searchEngine : 'google'}`,
      ];
    default:
      return [];
  }
}

/** JSON with sorted keys, so equal data always produces an equal string. */
export function fingerprint(value: unknown): string {
  const seen = new WeakSet<object>();

  const walk = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(walk);
    if (input && typeof input === 'object') {
      if (seen.has(input as object)) return null;
      seen.add(input as object);
      return Object.fromEntries(
        Object.entries(input as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, entry]) => [key, walk(entry)]),
      );
    }
    return input;
  };

  return JSON.stringify(walk(value)) ?? '';
}
