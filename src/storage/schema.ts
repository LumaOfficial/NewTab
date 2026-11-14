import { createId } from '../lib/utils';
import {
  getWidget,
  isWidgetSize,
  WIDGET_IDS,
  WIDGETS,
  type WidgetId,
  type WidgetSection,
  type WidgetSize,
} from '../widgets/catalogue';
import { DEFAULT_LAYOUT_PRESET, getLayoutPreset, type LayoutPresetId } from '../widgets/presets';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ClockFormat = '12h' | '24h';
export type SearchEngineId = 'google' | 'duckduckgo' | 'bing' | 'startpage' | 'custom';
export type ThemeCategoryId =
  | 'minimal'
  | 'futuristic'
  | 'colorful'
  | 'nature'
  | 'cinematic'
  | 'professional'
  | 'retro';
export type FontChoice = 'sans' | 'serif' | 'mono' | 'rounded';
export type ShadowStrength = 'none' | 'soft' | 'strong';
export type AnimationIntensity = 'full' | 'subtle' | 'none';
export type Density = 'compact' | 'cozy' | 'spacious';
export type TextSpacing = 'normal' | 'wide' | 'wider';
export type BackgroundKind = 'none' | 'solid' | 'gradient' | 'image' | 'video';
export type LayoutMode = 'preset' | 'custom';
export type WorkspaceKind = 'personal' | 'school' | 'work' | 'custom' | 'guest';
export type OnboardingStatus = 'pending' | 'completed' | 'skipped';

export interface BackgroundSettings {
  kind: BackgroundKind;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  animated: boolean;
  imageUrl: string;
  videoUrl: string;
  /** Scrim strength over a wallpaper/video, 0–80. */
  dim: number;
}

export interface TypographySettings {
  font: FontChoice;
  /** Optional custom font-family list, added in front of the stack. */
  customFont: string;
  /** Base font size in px. */
  size: number;
  textColor: string | null;
}

export interface SurfaceSettings {
  accentColor: string | null;
  /** 40–100. */
  opacity: number;
  /** 0–24 px. */
  blur: number;
  /** 0–28 px. */
  radius: number;
  shadow: ShadowStrength;
}

export interface MotionSettings {
  animation: AnimationIntensity;
  density: Density;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  colorBlindSafe: boolean;
  textSpacing: TextSpacing;
}

export interface CalendarSettings {
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn: 0 | 1;
  showWeekNumbers: boolean;
}

export interface KeyboardSettings {
  focusSearch: string;
  newNote: string;
  focusTimer: string;
  workspaceSwitcher: string;
}

export interface WidgetLayoutEntry {
  id: WidgetId;
  size: WidgetSize;
  section: WidgetSection;
  pinned: boolean;
}

export interface LayoutSettings {
  mode: LayoutMode;
  preset: LayoutPresetId;
  entries: WidgetLayoutEntry[];
  locked: boolean;
}

export interface LayoutSnapshot {
  id: string;
  label: string;
  at: number;
  layout: LayoutSettings;
  widgetOrder: WidgetId[];
  hiddenWidgets: WidgetId[];
}

export interface DashboardSettings {
  theme: ThemePreference;
  themeId: string;
  clockFormat: ClockFormat;
  displayName: string;
  searchEngine: SearchEngineId;
  customSearchUrl: string;
  searchSuggestions: boolean;
  searchInNewTab: boolean;
  background: BackgroundSettings;
  typography: TypographySettings;
  surface: SurfaceSettings;
  motion: MotionSettings;
  accessibility: AccessibilitySettings;
  calendar: CalendarSettings;
  keyboard: KeyboardSettings;
  layout: LayoutSettings;
  /** Order used to lay widgets out; always contains every known widget id. */
  widgetOrder: WidgetId[];
  /** Widgets the user has hidden. */
  hiddenWidgets: WidgetId[];
  /** Per-widget configuration, validated against the catalogue schema. */
  widgetSettings: Record<string, Record<string, unknown>>;
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
  pinned: boolean;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  /** Optional due date as an ISO day (`YYYY-MM-DD`). */
  dueAt: string | null;
  /** When the task was completed, for trend charts. */
  completedAt: number | null;
}

/** A calendar entry stored on this device (not a connected calendar). */
export interface CalendarEvent {
  id: string;
  title: string;
  /** `YYYY-MM-DD`. */
  date: string;
  time: string;
  notes: string;
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
  events: CalendarEvent[];
  trash: TrashEntry[];
  /** Widget-owned state (habits, timers, kanban cards…), validated per widget. */
  widgetState: Record<string, unknown>;
}

export interface ThemeRecipe {
  theme: ThemePreference;
  accentColor: string;
  textColor: string | null;
  background: BackgroundSettings;
  font: FontChoice;
  fontSize: number;
  widgetOpacity: number;
  widgetBlur: number;
  radius: number;
  shadow: ShadowStrength;
  animation: AnimationIntensity;
  density: Density;
}

export interface CustomTheme {
  id: string;
  name: string;
  category: ThemeCategoryId;
  baseThemeId: string;
  recipe: ThemeRecipe;
  createdAt: number;
}

export interface SavedLayout {
  id: string;
  name: string;
  createdAt: number;
  layout: LayoutSettings;
  widgetOrder: WidgetId[];
  hiddenWidgets: WidgetId[];
}

export interface OnboardingState {
  status: OnboardingStatus;
  completedAt: number | null;
}

export interface Workspace {
  id: string;
  name: string;
  /** A short emoji or letter shown in the switcher. */
  icon: string;
  kind: WorkspaceKind;
  createdAt: number;
  data: DashboardData;
  history: LayoutSnapshot[];
}

/** Everything persisted at once: all workspaces plus shared libraries. */
export interface DashboardRoot {
  version: number;
  activeWorkspaceId: string;
  workspaces: Workspace[];
  customThemes: CustomTheme[];
  savedLayouts: SavedLayout[];
  onboarding: OnboardingState;
}

export const STORAGE_KEY = 'luma.dashboard.v1';
export const DATA_VERSION = 3;
export const TRASH_LIMIT = 50;
export const SNAPSHOT_LIMIT = 12;

export const SEARCH_ENGINE_IDS: SearchEngineId[] = [
  'google',
  'duckduckgo',
  'bing',
  'startpage',
  'custom',
];
export const THEME_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];
export const CLOCK_FORMATS: ClockFormat[] = ['12h', '24h'];
export const BACKGROUND_KINDS: BackgroundKind[] = ['none', 'solid', 'gradient', 'image', 'video'];
export const FONT_CHOICES: FontChoice[] = ['sans', 'serif', 'mono', 'rounded'];
export const SHADOW_STRENGTHS: ShadowStrength[] = ['none', 'soft', 'strong'];
export const ANIMATION_LEVELS: AnimationIntensity[] = ['full', 'subtle', 'none'];
export const DENSITIES: Density[] = ['compact', 'cozy', 'spacious'];
export const TEXT_SPACINGS: TextSpacing[] = ['normal', 'wide', 'wider'];
export const WORKSPACE_KINDS: WorkspaceKind[] = ['personal', 'school', 'work', 'custom', 'guest'];

export function createDefaultBackground(): BackgroundSettings {
  return {
    kind: 'none',
    color: '#f1efea',
    gradientFrom: '#6f5bf0',
    gradientTo: '#ffb076',
    gradientAngle: 135,
    animated: false,
    imageUrl: '',
    videoUrl: '',
    dim: 24,
  };
}

export function createDefaultLayout(): LayoutSettings {
  const preset = getLayoutPreset(DEFAULT_LAYOUT_PRESET);
  return {
    mode: 'preset',
    preset: preset.id,
    locked: false,
    entries: preset.placements.map((placement) => {
      const descriptor = getWidget(placement.id);
      return {
        id: placement.id,
        size: placement.size ?? descriptor?.defaultSize ?? 'medium',
        section: placement.section ?? descriptor?.defaultSection ?? 'body',
        pinned: false,
      } satisfies WidgetLayoutEntry;
    }),
  };
}

export function createDefaultWidgetSettings(): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {};
  for (const widget of WIDGETS) {
    result[widget.id] = { ...(widget.defaults ?? {}) };
  }
  return result;
}

export function createDefaultSettings(): DashboardSettings {
  return {
    theme: 'system',
    themeId: 'luma-calm',
    clockFormat: '12h',
    displayName: '',
    searchEngine: 'google',
    customSearchUrl: '',
    searchSuggestions: true,
    searchInNewTab: true,
    background: createDefaultBackground(),
    typography: { font: 'sans', customFont: '', size: 15, textColor: null },
    surface: { accentColor: null, opacity: 78, blur: 14, radius: 18, shadow: 'soft' },
    motion: { animation: 'full', density: 'cozy' },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      colorBlindSafe: false,
      textSpacing: 'normal',
    },
    calendar: { weekStartsOn: 0, showWeekNumbers: false },
    keyboard: {
      focusSearch: 'mod+k',
      newNote: 'mod+shift+n',
      focusTimer: 'mod+shift+f',
      workspaceSwitcher: 'mod+shift+w',
    },
    layout: createDefaultLayout(),
    widgetOrder: [...WIDGET_IDS],
    hiddenWidgets: [],
    widgetSettings: createDefaultWidgetSettings(),
  };
}

export function createDefaultDashboard(): DashboardData {
  return {
    settings: createDefaultSettings(),
    shortcuts: [],
    notes: [],
    tasks: [],
    events: [],
    trash: [],
    widgetState: {},
  };
}

export function createWorkspace(
  name: string,
  kind: WorkspaceKind = 'custom',
  icon = '◆',
): Workspace {
  return {
    id: createId('workspace'),
    name,
    icon,
    kind,
    createdAt: Date.now(),
    data: createDefaultDashboard(),
    history: [],
  };
}

export function createDefaultRoot(): DashboardRoot {
  const workspace = createWorkspace('Personal', 'personal', '◆');
  return {
    version: DATA_VERSION,
    activeWorkspaceId: workspace.id,
    workspaces: [workspace],
    customThemes: [],
    savedLayouts: [],
    onboarding: { status: 'pending', completedAt: null },
  };
}

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

function readNumber(value: unknown, fallback: number, min?: number, max?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const boundedMin = min === undefined ? value : Math.max(min, value);
  return max === undefined ? boundedMin : Math.min(max, boundedMin);
}

function readTimestamp(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : Date.now();
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Accepts a plain hex colour only; anything else falls back. */
function readColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
    ? value.trim()
    : fallback;
}

/** A font-family list only: letters, digits, spaces, commas and quotes. */
function readFontFamily(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().slice(0, 80);
  return /^[a-zA-Z0-9\s,'"-]+$/.test(trimmed) ? trimmed : '';
}

function readNullableColor(value: unknown): string | null {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
    ? value.trim()
    : null;
}

/** Only http(s) URLs survive; a broken or hostile value becomes empty. */
export function readUrl(value: unknown, maxLength = 2048): string {
  const raw = typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function isWidgetId(value: unknown): value is WidgetId {
  return typeof value === 'string' && getWidget(value) !== undefined;
}

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
        pinned: readBoolean(entry.pinned, false),
      },
    ];
  });
}

function readIsoDay(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
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
        dueAt: readIsoDay(entry.dueAt),
        completedAt:
          typeof entry.completedAt === 'number' && Number.isFinite(entry.completedAt)
            ? entry.completedAt
            : null,
      },
    ];
  });
}

function readEvents(value: unknown): CalendarEvent[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): CalendarEvent[] => {
    if (!isRecord(entry)) return [];
    const title = readString(entry.title).trim();
    const date = readIsoDay(entry.date);
    if (!title || !date) return [];
    return [
      {
        id: readString(entry.id) || createId('event'),
        title: title.slice(0, 120),
        date,
        time: /^\d{2}:\d{2}$/.test(readString(entry.time)) ? readString(entry.time) : '',
        notes: readString(entry.notes).slice(0, 500),
      },
    ];
  });
}

function readLayout(value: unknown, widgetOrder: WidgetId[]): LayoutSettings {
  const defaults = createDefaultLayout();
  if (!isRecord(value)) return defaults;

  const mode: LayoutMode = value.mode === 'custom' ? 'custom' : 'preset';
  const preset = getLayoutPreset(readString(value.preset, defaults.preset)).id;

  const entries: WidgetLayoutEntry[] = [];
  const seen = new Set<WidgetId>();

  if (Array.isArray(value.entries)) {
    for (const entry of value.entries) {
      if (!isRecord(entry) || !isWidgetId(entry.id) || seen.has(entry.id)) continue;
      const descriptor = getWidget(entry.id);
      if (!descriptor) continue;
      seen.add(entry.id);

      const size = isWidgetSize(entry.size) && descriptor.sizes.includes(entry.size)
        ? entry.size
        : descriptor.defaultSize;
      const section: WidgetSection =
        entry.section === 'hero' || entry.section === 'body'
          ? entry.section
          : descriptor.defaultSection;

      entries.push({ id: entry.id, size, section, pinned: readBoolean(entry.pinned, false) });
    }
  }

  if (entries.length === 0) {
    for (const id of widgetOrder) {
      const descriptor = getWidget(id);
      if (!descriptor) continue;
      entries.push({
        id,
        size: descriptor.defaultSize,
        section: descriptor.defaultSection,
        pinned: false,
      });
    }
  }

  return { mode, preset, locked: readBoolean(value.locked, false), entries };
}

function readWidgetSettings(value: unknown): Record<string, Record<string, unknown>> {
  const result = createDefaultWidgetSettings();
  if (!isRecord(value)) return result;

  for (const widget of WIDGETS) {
    if (!widget.settings) continue;
    const incoming = value[widget.id];
    if (!isRecord(incoming)) continue;

    const clean: Record<string, unknown> = { ...(widget.defaults ?? {}) };
    for (const field of widget.settings) {
      const raw = incoming[field.key];
      if (field.type === 'toggle') {
        clean[field.key] = readBoolean(raw, Boolean(clean[field.key]));
      } else if (field.type === 'number') {
        clean[field.key] = readNumber(raw, Number(clean[field.key]) || field.min || 0, field.min, field.max);
      } else if (field.type === 'select') {
        const values = (field.options ?? []).map((option) => option.value);
        clean[field.key] = readEnum(
          raw,
          values,
          typeof clean[field.key] === 'string' ? (clean[field.key] as string) : values[0] ?? '',
        );
      } else {
        clean[field.key] = readString(raw, readString(clean[field.key])).slice(0, 500);
      }
    }
    result[widget.id] = clean;
  }

  return result;
}

export function sanitizeSettings(value: unknown): DashboardSettings {
  const defaults = createDefaultSettings();
  if (!isRecord(value)) return defaults;

  const widgetOrder = normalizeWidgetOrder(value.widgetOrder);
  const layout = readLayout(value.layout, widgetOrder);

  // Keep the flat order aligned with the layout, then append anything the
  // layout does not mention so no widget can be lost.
  const ordered = [...layout.entries.map((entry) => entry.id), ...widgetOrder];
  const seen = new Set<WidgetId>();
  const alignedOrder = ordered.filter((id) => {
    if (seen.has(id) || !isWidgetId(id)) return false;
    seen.add(id);
    return true;
  });

  const background = isRecord(value.background) ? value.background : {};
  const typography = isRecord(value.typography) ? value.typography : {};
  const surface = isRecord(value.surface) ? value.surface : {};
  const motion = isRecord(value.motion) ? value.motion : {};
  const accessibility = isRecord(value.accessibility) ? value.accessibility : {};
  const calendar = isRecord(value.calendar) ? value.calendar : {};
  const keyboard = isRecord(value.keyboard) ? value.keyboard : {};

  return {
    theme: readEnum(value.theme, THEME_PREFERENCES, defaults.theme),
    themeId: readString(value.themeId, defaults.themeId).slice(0, 80) || defaults.themeId,
    clockFormat: readEnum(value.clockFormat, CLOCK_FORMATS, defaults.clockFormat),
    displayName: readString(value.displayName).slice(0, 40),
    searchEngine: readEnum(value.searchEngine, SEARCH_ENGINE_IDS, defaults.searchEngine),
    customSearchUrl: readUrl(value.customSearchUrl),
    searchSuggestions: readBoolean(value.searchSuggestions, defaults.searchSuggestions),
    searchInNewTab: readBoolean(value.searchInNewTab, defaults.searchInNewTab),
    background: {
      kind: readEnum(background.kind, BACKGROUND_KINDS, defaults.background.kind),
      color: readColor(background.color, defaults.background.color),
      gradientFrom: readColor(background.gradientFrom, defaults.background.gradientFrom),
      gradientTo: readColor(background.gradientTo, defaults.background.gradientTo),
      gradientAngle: readNumber(background.gradientAngle, defaults.background.gradientAngle, 0, 360),
      animated: readBoolean(background.animated, defaults.background.animated),
      imageUrl: readUrl(background.imageUrl),
      videoUrl: readUrl(background.videoUrl),
      dim: readNumber(background.dim, defaults.background.dim, 0, 80),
    },
    typography: {
      font: readEnum(typography.font, FONT_CHOICES, defaults.typography.font),
      customFont: readFontFamily(typography.customFont),
      size: readNumber(typography.size, defaults.typography.size, 12, 24),
      textColor: readNullableColor(typography.textColor),
    },
    surface: {
      accentColor: readNullableColor(surface.accentColor),
      opacity: readNumber(surface.opacity, defaults.surface.opacity, 40, 100),
      blur: readNumber(surface.blur, defaults.surface.blur, 0, 24),
      radius: readNumber(surface.radius, defaults.surface.radius, 0, 28),
      shadow: readEnum(surface.shadow, SHADOW_STRENGTHS, defaults.surface.shadow),
    },
    motion: {
      animation: readEnum(motion.animation, ANIMATION_LEVELS, defaults.motion.animation),
      density: readEnum(motion.density, DENSITIES, defaults.motion.density),
    },
    accessibility: {
      highContrast: readBoolean(accessibility.highContrast, defaults.accessibility.highContrast),
      reducedMotion: readBoolean(accessibility.reducedMotion, defaults.accessibility.reducedMotion),
      largeText: readBoolean(accessibility.largeText, defaults.accessibility.largeText),
      colorBlindSafe: readBoolean(
        accessibility.colorBlindSafe,
        defaults.accessibility.colorBlindSafe,
      ),
      textSpacing: readEnum(accessibility.textSpacing, TEXT_SPACINGS, defaults.accessibility.textSpacing),
    },
    calendar: {
      weekStartsOn: readNumber(calendar.weekStartsOn, defaults.calendar.weekStartsOn, 0, 1) === 1 ? 1 : 0,
      showWeekNumbers: readBoolean(calendar.showWeekNumbers, defaults.calendar.showWeekNumbers),
    },
    keyboard: {
      focusSearch: readString(keyboard.focusSearch, defaults.keyboard.focusSearch).slice(0, 40),
      newNote: readString(keyboard.newNote, defaults.keyboard.newNote).slice(0, 40),
      focusTimer: readString(keyboard.focusTimer, defaults.keyboard.focusTimer).slice(0, 40),
      workspaceSwitcher: readString(
        keyboard.workspaceSwitcher,
        defaults.keyboard.workspaceSwitcher,
      ).slice(0, 40),
    },
    layout,
    widgetOrder: alignedOrder,
    hiddenWidgets: readWidgetList(value.hiddenWidgets),
    widgetSettings: readWidgetSettings(value.widgetSettings),
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
            pinned: readBoolean(item.pinned, false),
          }
        : kind === 'task'
          ? {
              id: itemId,
              text: readString(item.text),
              done: readBoolean(item.done, false),
              createdAt: readTimestamp(item.createdAt),
              dueAt: readIsoDay(item.dueAt),
              completedAt:
                typeof item.completedAt === 'number' && Number.isFinite(item.completedAt)
                  ? item.completedAt
                  : null,
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

function readWidgetState(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {};

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key.length > 60) continue;
    try {
      // Keep only JSON-safe widget state; a broken value falls back to empty.
      result[key] = JSON.parse(JSON.stringify(entry)) as unknown;
    } catch {
      // Ignore an unserialisable entry.
    }
  }
  return result;
}

export function sanitizeDashboard(value: unknown): DashboardData {
  if (!isRecord(value)) return createDefaultDashboard();

  return {
    settings: sanitizeSettings(value.settings),
    shortcuts: readShortcuts(value.shortcuts),
    notes: readNotes(value.notes),
    tasks: readTasks(value.tasks),
    events: readEvents(value.events),
    trash: readTrash(value.trash),
    widgetState: readWidgetState(value.widgetState),
  };
}

function readSnapshot(value: unknown): LayoutSnapshot | null {
  if (!isRecord(value)) return null;
  const data = sanitizeDashboard({
    settings: {
      layout: value.layout,
      widgetOrder: value.widgetOrder,
      hiddenWidgets: value.hiddenWidgets,
    },
  });
  return {
    id: readString(value.id) || createId('snapshot'),
    label: readString(value.label, 'Previous layout').slice(0, 60),
    at: readTimestamp(value.at),
    layout: data.settings.layout,
    widgetOrder: data.settings.widgetOrder,
    hiddenWidgets: data.settings.hiddenWidgets,
  };
}

function readHistory(value: unknown): LayoutSnapshot[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(readSnapshot)
    .filter((entry): entry is LayoutSnapshot => entry !== null)
    .slice(0, SNAPSHOT_LIMIT);
}

function readWorkspace(value: unknown): Workspace | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  if (!id) return null;

  const kind = readEnum(value.kind, WORKSPACE_KINDS, 'custom');
  const name = readString(value.name, 'Workspace').trim().slice(0, 40) || 'Workspace';

  return {
    id,
    name,
    icon: readString(value.icon, '◆').slice(0, 4) || '◆',
    kind,
    createdAt: readTimestamp(value.createdAt),
    data: sanitizeDashboard(value.data),
    history: readHistory(value.history),
  };
}

export function sanitizeRoot(value: unknown): DashboardRoot {
  const defaults = createDefaultRoot();
  if (!isRecord(value)) return defaults;

  // A record from the previous single-dashboard phase is wrapped, never lost.
  if (!Array.isArray(value.workspaces) && (isRecord(value.settings) || Array.isArray(value.tasks))) {
    const workspace = createWorkspace('Personal', 'personal', '◆');
    workspace.data = sanitizeDashboard(value);
    return {
      ...defaults,
      activeWorkspaceId: workspace.id,
      workspaces: [workspace],
      onboarding: { status: 'completed', completedAt: Date.now() },
    };
  }

  const workspaces = (Array.isArray(value.workspaces) ? value.workspaces : [])
    .map(readWorkspace)
    .filter((entry): entry is Workspace => entry !== null);

  if (workspaces.length === 0) return defaults;

  const activeWorkspaceId =
    typeof value.activeWorkspaceId === 'string' &&
    workspaces.some((workspace) => workspace.id === value.activeWorkspaceId)
      ? value.activeWorkspaceId
      : workspaces[0].id;

  const customThemes = (Array.isArray(value.customThemes) ? value.customThemes : [])
    .flatMap((entry): CustomTheme[] => {
      if (!isRecord(entry)) return [];
      const id = readString(entry.id);
      if (!id) return [];
      return [
        {
          id,
          name: readString(entry.name, 'Custom theme').trim().slice(0, 40) || 'Custom theme',
          category: readEnum(
            entry.category,
            ['minimal', 'futuristic', 'colorful', 'nature', 'cinematic', 'professional', 'retro'] as const,
            'minimal',
          ),
          baseThemeId: readString(entry.baseThemeId, 'luma-calm').slice(0, 80),
          recipe: readThemeRecipe(entry.recipe),
          createdAt: readTimestamp(entry.createdAt),
        },
      ];
    });

  const savedLayouts = (Array.isArray(value.savedLayouts) ? value.savedLayouts : [])
    .flatMap((entry): SavedLayout[] => {
      if (!isRecord(entry)) return [];
      const id = readString(entry.id);
      if (!id) return [];
      const data = sanitizeDashboard({
        settings: {
          layout: entry.layout,
          widgetOrder: entry.widgetOrder,
          hiddenWidgets: entry.hiddenWidgets,
        },
      });
      return [
        {
          id,
          name: readString(entry.name, 'Saved layout').trim().slice(0, 40) || 'Saved layout',
          createdAt: readTimestamp(entry.createdAt),
          layout: data.settings.layout,
          widgetOrder: data.settings.widgetOrder,
          hiddenWidgets: data.settings.hiddenWidgets,
        },
      ];
    });

  const onboarding = isRecord(value.onboarding) ? value.onboarding : {};

  return {
    version: DATA_VERSION,
    activeWorkspaceId,
    workspaces,
    customThemes,
    savedLayouts,
    onboarding: {
      status: readEnum(onboarding.status, ['pending', 'completed', 'skipped'] as const, 'completed'),
      completedAt:
        typeof onboarding.completedAt === 'number' && Number.isFinite(onboarding.completedAt)
          ? onboarding.completedAt
          : null,
    },
  };
}

export function readThemeRecipe(value: unknown): ThemeRecipe {
  const defaults = createDefaultSettings();
  const record = isRecord(value) ? value : {};
  return {
    theme: readEnum(record.theme, THEME_PREFERENCES, defaults.theme),
    accentColor: readColor(record.accentColor, '#5b4bd8'),
    textColor: readNullableColor(record.textColor),
    background: sanitizeSettings({ background: record.background }).background,
    font: readEnum(record.font, FONT_CHOICES, defaults.typography.font),
    fontSize: readNumber(record.fontSize, defaults.typography.size, 12, 24),
    widgetOpacity: readNumber(record.widgetOpacity, defaults.surface.opacity, 40, 100),
    widgetBlur: readNumber(record.widgetBlur, defaults.surface.blur, 0, 24),
    radius: readNumber(record.radius, defaults.surface.radius, 0, 28),
    shadow: readEnum(record.shadow, SHADOW_STRENGTHS, defaults.surface.shadow),
    animation: readEnum(record.animation, ANIMATION_LEVELS, defaults.motion.animation),
    density: readEnum(record.density, DENSITIES, defaults.motion.density),
  };
}
