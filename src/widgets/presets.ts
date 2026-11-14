/**
 * Preset dashboard layouts.
 *
 * A preset only picks widgets and their sizes — the same grid, storage and
 * customization rules apply to every layout, so a preset can be edited into a
 * custom layout afterwards. Widgets not listed stay hidden rather than
 * disappearing, so switching presets is never destructive.
 */
import { WIDGETS, type WidgetSection, type WidgetSize } from './catalogue';

export type LayoutPresetId =
  | 'minimal'
  | 'productivity'
  | 'school'
  | 'work'
  | 'personal'
  | 'media'
  | 'information'
  | 'complete';

export interface PresetPlacement {
  id: string;
  size?: WidgetSize;
  section?: WidgetSection;
}

export interface LayoutPreset {
  id: LayoutPresetId;
  label: string;
  description: string;
  placements: PresetPlacement[];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'A clock, a greeting and search. Nothing else in the way.',
    placements: [
      { id: 'clock', size: 'medium' },
      { id: 'greeting', size: 'medium' },
      { id: 'search', size: 'full' },
    ],
  },
  {
    id: 'productivity',
    label: 'Productivity',
    description: 'Tasks, focus tools, habits and notes together.',
    placements: [
      { id: 'greeting', size: 'medium' },
      { id: 'clock', size: 'medium' },
      { id: 'search', size: 'full' },
      { id: 'tasks', size: 'medium' },
      { id: 'focus-timer', size: 'small' },
      { id: 'habits', size: 'medium' },
      { id: 'notes', size: 'medium' },
      { id: 'daily-goals', size: 'small' },
      { id: 'daily-briefing', size: 'wide' },
    ],
  },
  {
    id: 'school',
    label: 'School',
    description: 'Classes, deadlines, notes and focus time.',
    placements: [
      { id: 'greeting', size: 'medium' },
      { id: 'clock', size: 'medium' },
      { id: 'search', size: 'full' },
      { id: 'calendar-agenda', size: 'medium' },
      { id: 'deadline-reminders', size: 'medium' },
      { id: 'notes', size: 'medium' },
      { id: 'tasks', size: 'medium' },
      { id: 'focus-timer', size: 'small' },
      { id: 'shortcuts', size: 'wide' },
    ],
  },
  {
    id: 'work',
    label: 'Work',
    description: 'Agenda, kanban, priorities and a briefing.',
    placements: [
      { id: 'clock', size: 'medium' },
      { id: 'greeting', size: 'medium' },
      { id: 'search', size: 'full' },
      { id: 'calendar-agenda', size: 'medium' },
      { id: 'kanban', size: 'wide' },
      { id: 'tasks', size: 'medium' },
      { id: 'daily-briefing', size: 'medium' },
      { id: 'shortcuts', size: 'wide' },
      { id: 'focus-timer', size: 'small' },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    description: 'Habits, birthdays, links and a little calm.',
    placements: [
      { id: 'clock', size: 'medium' },
      { id: 'greeting', size: 'medium' },
      { id: 'search', size: 'full' },
      { id: 'habits', size: 'medium' },
      { id: 'birthdays', size: 'small' },
      { id: 'shortcuts', size: 'wide' },
      { id: 'notes', size: 'medium' },
      { id: 'upcoming-events', size: 'medium' },
      { id: 'messaging', size: 'small' },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Now playing, recent media and quick links.',
    placements: [
      { id: 'clock', size: 'medium' },
      { id: 'greeting', size: 'medium' },
      { id: 'search', size: 'full' },
      { id: 'spotify', size: 'medium' },
      { id: 'mini-player', size: 'small' },
      { id: 'youtube-music', size: 'medium' },
      { id: 'recent-media', size: 'medium' },
      { id: 'volume', size: 'small' },
      { id: 'shortcuts', size: 'wide' },
    ],
  },
  {
    id: 'information',
    label: 'Information dashboard',
    description: 'Weather, headlines, markets and your next events.',
    placements: [
      { id: 'clock', size: 'medium' },
      { id: 'date', size: 'small' },
      { id: 'search', size: 'full' },
      { id: 'weather', size: 'medium' },
      { id: 'news', size: 'medium' },
      { id: 'stocks', size: 'medium' },
      { id: 'crypto', size: 'small' },
      { id: 'upcoming-events', size: 'medium' },
      { id: 'rss', size: 'medium' },
    ],
  },
  {
    id: 'complete',
    label: 'Complete dashboard',
    description: 'Every widget, so nothing is hidden from you on day one.',
    placements: WIDGETS.map((widget) => ({
      id: widget.id,
      size: widget.defaultSize,
      section: widget.defaultSection,
    })),
  },
];

export function getLayoutPreset(id: string): LayoutPreset {
  return LAYOUT_PRESETS.find((preset) => preset.id === id) ?? LAYOUT_PRESETS[0];
}

export const DEFAULT_LAYOUT_PRESET: LayoutPresetId = 'complete';
