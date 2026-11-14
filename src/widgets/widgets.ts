/**
 * Widget catalogue.
 *
 * Widget ids, labels and placement live here (no React), so storage, the
 * reducer and the settings UI can reason about widgets without importing any
 * component. `src/widgets/index.tsx` maps each id to its component.
 *
 * Adding a widget later means: append its id, describe it here, and register a
 * component. Stored dashboards pick it up automatically.
 */

export const WIDGET_IDS = ['clock', 'greeting', 'search', 'shortcuts', 'notes', 'tasks'] as const;

export type WidgetId = (typeof WIDGET_IDS)[number];

export type WidgetPlacement = 'hero' | 'body';

export interface WidgetMeta {
  id: WidgetId;
  title: string;
  description: string;
  placement: WidgetPlacement;
  /** `full` spans both dashboard columns on wide screens. */
  span: 'full' | 'half';
}

export const WIDGETS: Record<WidgetId, WidgetMeta> = {
  clock: {
    id: 'clock',
    title: 'Clock & date',
    description: 'Large local time with today’s date.',
    placement: 'hero',
    span: 'half',
  },
  greeting: {
    id: 'greeting',
    title: 'Greeting',
    description: 'A time-aware greeting, personalised with your name.',
    placement: 'hero',
    span: 'half',
  },
  search: {
    id: 'search',
    title: 'Search',
    description: 'Search the web from your new tab.',
    placement: 'body',
    span: 'full',
  },
  shortcuts: {
    id: 'shortcuts',
    title: 'Shortcuts',
    description: 'Tiles for the sites you open most.',
    placement: 'body',
    span: 'full',
  },
  notes: {
    id: 'notes',
    title: 'Notes',
    description: 'Quick notes stored on this device.',
    placement: 'body',
    span: 'half',
  },
  tasks: {
    id: 'tasks',
    title: 'Tasks',
    description: 'A lightweight to-do list for today.',
    placement: 'body',
    span: 'half',
  },
};
