/**
 * Widget catalogue.
 *
 * One source of truth for every widget: its id, copy, category, default size,
 * whether it needs an extension permission or a connected service, and the
 * settings it exposes. Nothing here imports React, so storage, the reducer,
 * layout presets and the settings UI can all reason about widgets without
 * pulling in components. `src/widgets/registry.tsx` maps each id to its
 * component.
 *
 * Adding a widget is: append a descriptor here, add its component, register it.
 * Stored dashboards pick it up automatically.
 */

export type WidgetCategoryId =
  | 'core'
  | 'productivity'
  | 'time'
  | 'navigation'
  | 'media'
  | 'information'
  | 'browser'
  | 'personal';

export interface WidgetCategory {
  id: WidgetCategoryId;
  label: string;
  description: string;
}

export const WIDGET_CATEGORIES: WidgetCategory[] = [
  { id: 'core', label: 'Essentials', description: 'The pieces almost every dashboard keeps.' },
  {
    id: 'productivity',
    label: 'Productivity',
    description: 'Tasks, notes, focus tools and habits.',
  },
  { id: 'time', label: 'Time & planning', description: 'Clocks, countdowns and your agenda.' },
  { id: 'navigation', label: 'Navigation', description: 'Search, shortcuts and browser tabs.' },
  { id: 'media', label: 'Media', description: 'Music and podcast controls.' },
  { id: 'information', label: 'Information', description: 'Weather, news, feeds and markets.' },
  { id: 'browser', label: 'Browser utilities', description: 'Downloads, tabs and device status.' },
  { id: 'personal', label: 'Personal & links', description: 'Email, contacts, embeds and links.' },
];

export type WidgetSize = 'small' | 'medium' | 'wide' | 'full';
export type WidgetSection = 'hero' | 'body';
export type WidgetPermission = 'bookmarks' | 'history' | 'tabs' | 'downloads' | 'sessions';

/** Services that exist in the account integration catalogue. */
export type WidgetIntegrationId =
  | 'google-calendar'
  | 'outlook-calendar'
  | 'spotify'
  | 'youtube-music'
  | 'weather'
  | 'email-preview'
  | 'contacts'
  | 'messaging'
  | 'news'
  | 'rss'
  | 'stocks'
  | 'crypto'
  | 'sports'
  | 'transit';

export type WidgetSettingType = 'text' | 'number' | 'select' | 'toggle' | 'textarea';

export interface WidgetSettingField {
  key: string;
  label: string;
  type: WidgetSettingType;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
}

export type WidgetIconName =
  | 'clock'
  | 'spark'
  | 'search'
  | 'task'
  | 'note'
  | 'timer'
  | 'calendar'
  | 'habit'
  | 'chart'
  | 'board'
  | 'music'
  | 'volume'
  | 'cloud'
  | 'news'
  | 'bookmark'
  | 'tabs'
  | 'download'
  | 'battery'
  | 'wifi'
  | 'mail'
  | 'contacts'
  | 'link'
  | 'grid'
  | 'layers'
  | 'film'
  | 'shield';

export interface WidgetDescriptor {
  id: string;
  title: string;
  description: string;
  category: WidgetCategoryId;
  icon: WidgetIconName;
  /** Sizes this widget can take. Small widgets only offer small/medium. */
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
  defaultSection: WidgetSection;
  /** True when the widget renders with no network and no permission. */
  worksOffline: boolean;
  /** Extension permission the widget needs. Surfaces an honest setup state. */
  permission?: WidgetPermission;
  /** Connected service the widget needs. Surfaces an honest setup state. */
  integration?: WidgetIntegrationId;
  settings?: WidgetSettingField[];
  /** Default values for the settings above. */
  defaults?: Record<string, unknown>;
  /** Extra words matched by the widget search. */
  keywords?: string[];
  /** Widgets that ship enabled in the default "complete" dashboard. */
  featured?: boolean;
}

const timeZonesField: WidgetSettingField = {
  key: 'zones',
  label: 'Time zones',
  type: 'text',
  placeholder: 'America/New_York, Europe/London',
  hint: 'Comma-separated IANA names, e.g. Europe/Lisbon.',
};

export const WIDGETS: WidgetDescriptor[] = [
  /* Core ------------------------------------------------------------------ */
  {
    id: 'clock',
    title: 'Clock',
    description: 'Local time and today’s date, with an optional seconds display.',
    category: 'core',
    icon: 'clock',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'hero',
    worksOffline: true,
    settings: [{ key: 'seconds', label: 'Show seconds', type: 'toggle' }],
    defaults: { seconds: false },
    featured: true,
    keywords: ['time', 'date'],
  },
  {
    id: 'greeting',
    title: 'Greeting',
    description: 'A time-aware greeting, personalised with your name.',
    category: 'core',
    icon: 'spark',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'hero',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'search',
    title: 'Search',
    description: 'Web search plus local results, quick commands and calculations.',
    category: 'core',
    icon: 'search',
    sizes: ['wide', 'full'],
    defaultSize: 'full',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
    keywords: ['find', 'web'],
  },

  /* Productivity ---------------------------------------------------------- */
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'A lightweight to-do list for today.',
    category: 'productivity',
    icon: 'task',
    sizes: ['medium', 'wide', 'full'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
    keywords: ['todo', 'to-do', 'checklist'],
  },
  {
    id: 'subtasks',
    title: 'Subtasks',
    description: 'Break each task into smaller steps and tick them off.',
    category: 'productivity',
    icon: 'task',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'notes',
    title: 'Notes',
    description: 'Quick notes stored on this device.',
    category: 'productivity',
    icon: 'note',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'pinned-notes',
    title: 'Pinned notes',
    description: 'Keep the notes you marked as pinned in view.',
    category: 'productivity',
    icon: 'note',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'focus-timer',
    title: 'Focus timer',
    description: 'A simple countdown for a block of deep work.',
    category: 'productivity',
    icon: 'timer',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
    keywords: ['timer', 'deep work'],
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro timer',
    description: 'Focus and break cycles with a running session count.',
    category: 'productivity',
    icon: 'timer',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'habits',
    title: 'Habits',
    description: 'Tick daily habits and watch the streak build.',
    category: 'productivity',
    icon: 'habit',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'daily-goals',
    title: 'Daily goals',
    description: 'A short list of goals for today with a progress bar.',
    category: 'productivity',
    icon: 'habit',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'reminders',
    title: 'Reminders',
    description: 'Time-stamped reminders you see when you open a new tab.',
    category: 'productivity',
    icon: 'timer',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'daily-briefing',
    title: 'Daily briefing',
    description: 'Your tasks, habits, events and focus time in one summary.',
    category: 'productivity',
    icon: 'grid',
    sizes: ['small', 'medium', 'wide', 'full'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'productivity-analytics',
    title: 'Productivity analytics',
    description: 'Completion trends from your tasks and habits.',
    category: 'productivity',
    icon: 'chart',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'kanban',
    title: 'Kanban board',
    description: 'Move small cards through To do, Doing and Done.',
    category: 'productivity',
    icon: 'board',
    sizes: ['wide', 'full'],
    defaultSize: 'wide',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'ai-plan',
    title: 'AI daily plan',
    description: 'A place for an AI-generated plan once an assistant is connected.',
    category: 'productivity',
    icon: 'spark',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: false,
    featured: true,
  },

  /* Time ------------------------------------------------------------------ */
  {
    id: 'date',
    title: 'Date',
    description: 'Today’s date, week number and day of the year.',
    category: 'time',
    icon: 'calendar',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'hero',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'world-clocks',
    title: 'World clocks',
    description: 'Times in the cities you choose.',
    category: 'time',
    icon: 'clock',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    settings: [timeZonesField],
    defaults: { zones: 'America/New_York, Europe/London, Asia/Tokyo' },
    featured: true,
  },
  {
    id: 'countdown',
    title: 'Countdown',
    description: 'Count down to a date that matters.',
    category: 'time',
    icon: 'timer',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    settings: [
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Holiday' },
      { key: 'target', label: 'Target date', type: 'text', placeholder: '2026-12-24' },
    ],
    defaults: { label: 'New year', target: '' },
    featured: true,
  },
  {
    id: 'calendar-agenda',
    title: 'Calendar agenda',
    description: 'Events for the next few days, added here or from a calendar.',
    category: 'time',
    icon: 'calendar',
    sizes: ['medium', 'wide', 'full'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    settings: [{ key: 'days', label: 'Days ahead', type: 'number', min: 1, max: 14 }],
    defaults: { days: 3 },
    featured: true,
  },
  {
    id: 'upcoming-events',
    title: 'Upcoming events',
    description: 'The next few events on your Luma calendar.',
    category: 'time',
    icon: 'calendar',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'birthdays',
    title: 'Birthdays',
    description: 'Remember the people who matter, with days to go.',
    category: 'time',
    icon: 'spark',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'deadline-reminders',
    title: 'Deadline reminders',
    description: 'Tasks with a due date, closest first.',
    category: 'time',
    icon: 'timer',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },

  /* Navigation ------------------------------------------------------------ */
  {
    id: 'shortcuts',
    title: 'Shortcuts',
    description: 'Tiles for the sites you open most.',
    category: 'navigation',
    icon: 'link',
    sizes: ['wide', 'full'],
    defaultSize: 'wide',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
    keywords: ['links', 'bookmarks'],
  },
  {
    id: 'bookmarks',
    title: 'Bookmarks',
    description: 'Search your browser bookmarks from the new tab.',
    category: 'navigation',
    icon: 'bookmark',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'bookmarks',
    featured: true,
  },
  {
    id: 'recent-visits',
    title: 'Recently visited',
    description: 'The sites you visited most recently.',
    category: 'navigation',
    icon: 'clock',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'history',
    featured: true,
  },
  {
    id: 'open-tabs',
    title: 'Open tabs',
    description: 'Every open tab, grouped by window.',
    category: 'navigation',
    icon: 'tabs',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'tabs',
    featured: true,
  },
  {
    id: 'tab-search',
    title: 'Tab search',
    description: 'Find an open tab without leaving the new tab.',
    category: 'navigation',
    icon: 'tabs',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'tabs',
    featured: true,
  },
  {
    id: 'closed-tabs',
    title: 'Recently closed tabs',
    description: 'Reopen a tab you closed by mistake.',
    category: 'navigation',
    icon: 'tabs',
    sizes: ['small', 'medium'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'sessions',
    featured: true,
  },
  {
    id: 'saved-sessions',
    title: 'Saved sessions',
    description: 'Save a set of tabs and reopen it later.',
    category: 'navigation',
    icon: 'layers',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'tabs',
    featured: true,
  },
  {
    id: 'extensions',
    title: 'Installed extensions',
    description: 'Your installed Opera extensions in one place.',
    category: 'navigation',
    icon: 'grid',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'sessions',
    featured: true,
  },

  /* Media ----------------------------------------------------------------- */
  {
    id: 'spotify',
    title: 'Spotify',
    description: 'See and control what is playing in Spotify.',
    category: 'media',
    icon: 'music',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'spotify',
    featured: true,
  },
  {
    id: 'youtube-music',
    title: 'YouTube Music',
    description: 'See and control YouTube Music playback.',
    category: 'media',
    icon: 'music',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'youtube-music',
    featured: true,
  },
  {
    id: 'podcast',
    title: 'Podcast controls',
    description: 'Play, pause and skip your podcast.',
    category: 'media',
    icon: 'music',
    sizes: ['small', 'medium'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'spotify',
    featured: true,
  },
  {
    id: 'mini-player',
    title: 'Mini player',
    description: 'A compact now-playing card for connected media.',
    category: 'media',
    icon: 'film',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'spotify',
    featured: true,
  },
  {
    id: 'recent-media',
    title: 'Recently played',
    description: 'Pick up where you left off.',
    category: 'media',
    icon: 'music',
    sizes: ['small', 'medium'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'spotify',
    featured: true,
  },
  {
    id: 'volume',
    title: 'Volume',
    description: 'A quick volume slider for the page.',
    category: 'media',
    icon: 'volume',
    sizes: ['small'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },

  /* Information ----------------------------------------------------------- */
  {
    id: 'weather',
    title: 'Weather',
    description: 'Current conditions for a place you choose.',
    category: 'information',
    icon: 'cloud',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'weather',
    settings: [{ key: 'location', label: 'Location', type: 'text', placeholder: 'Indianapolis' }],
    defaults: { location: '' },
    featured: true,
  },
  {
    id: 'news',
    title: 'News',
    description: 'Headlines from a connected news service.',
    category: 'information',
    icon: 'news',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'news',
    featured: true,
  },
  {
    id: 'rss',
    title: 'RSS feed',
    description: 'Headlines from a feed URL you choose.',
    category: 'information',
    icon: 'news',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'rss',
    settings: [
      {
        key: 'feedUrl',
        label: 'Feed URL',
        type: 'text',
        placeholder: 'https://example.com/feed.xml',
      },
    ],
    defaults: { feedUrl: '' },
    featured: true,
  },
  {
    id: 'stocks',
    title: 'Stocks',
    description: 'Watch a short list of tickers.',
    category: 'information',
    icon: 'chart',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'stocks',
    settings: [{ key: 'symbols', label: 'Symbols', type: 'text', placeholder: 'AAPL, MSFT' }],
    defaults: { symbols: '' },
    featured: true,
  },
  {
    id: 'crypto',
    title: 'Cryptocurrency',
    description: 'Prices for the coins you follow.',
    category: 'information',
    icon: 'chart',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'crypto',
    settings: [{ key: 'coins', label: 'Coins', type: 'text', placeholder: 'BTC, ETH' }],
    defaults: { coins: '' },
    featured: true,
  },
  {
    id: 'sports',
    title: 'Sports scores',
    description: 'Latest scores for your teams.',
    category: 'information',
    icon: 'chart',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'sports',
    featured: true,
  },
  {
    id: 'transit',
    title: 'Transit & commute',
    description: 'Your usual route, when a transit service is connected.',
    category: 'information',
    icon: 'layers',
    sizes: ['small', 'medium'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'transit',
    featured: true,
  },

  /* Browser utilities ----------------------------------------------------- */
  {
    id: 'downloads',
    title: 'Downloads',
    description: 'Recent downloads from this browser.',
    category: 'browser',
    icon: 'download',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'downloads',
    featured: true,
  },
  {
    id: 'browser-settings',
    title: 'Browser shortcuts',
    description: 'Jump straight to privacy, extensions and download settings.',
    category: 'browser',
    icon: 'grid',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'incognito',
    title: 'Incognito launcher',
    description: 'A reminder of how to open a private window in Opera.',
    category: 'browser',
    icon: 'shield',
    sizes: ['small'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'tab-cleanup',
    title: 'One-click tab cleanup',
    description: 'Close duplicate or idle tabs safely.',
    category: 'browser',
    icon: 'tabs',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'tabs',
    featured: true,
  },
  {
    id: 'duplicate-tabs',
    title: 'Duplicate tabs',
    description: 'Find tabs that point at the same page.',
    category: 'browser',
    icon: 'tabs',
    sizes: ['small', 'medium'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    permission: 'tabs',
    featured: true,
  },
  {
    id: 'battery',
    title: 'Battery',
    description: 'Battery level and charging state when available.',
    category: 'browser',
    icon: 'battery',
    sizes: ['small'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'network',
    title: 'Network',
    description: 'Online state and connection type.',
    category: 'browser',
    icon: 'wifi',
    sizes: ['small'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },

  /* Personal -------------------------------------------------------------- */
  {
    id: 'email-preview',
    title: 'Email preview',
    description: 'Your latest messages, once a mailbox is connected.',
    category: 'personal',
    icon: 'mail',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'email-preview',
    featured: true,
  },
  {
    id: 'unread-email',
    title: 'Unread email',
    description: 'An unread count from a connected mailbox.',
    category: 'personal',
    icon: 'mail',
    sizes: ['small'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'email-preview',
    featured: true,
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'Quick access to the people you message most.',
    category: 'personal',
    icon: 'contacts',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: false,
    integration: 'contacts',
    featured: true,
  },
  {
    id: 'messaging',
    title: 'Messaging links',
    description: 'One tap to the messaging apps you use.',
    category: 'personal',
    icon: 'contacts',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
  {
    id: 'embed',
    title: 'Custom embed',
    description: 'Embed a page you trust, with a clear fallback if it refuses.',
    category: 'personal',
    icon: 'film',
    sizes: ['medium', 'wide', 'full'],
    defaultSize: 'wide',
    defaultSection: 'body',
    worksOffline: false,
    settings: [
      { key: 'url', label: 'Page URL', type: 'text', placeholder: 'https://example.com' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'My embed' },
      { key: 'height', label: 'Height (px)', type: 'number', min: 120, max: 640 },
    ],
    defaults: { url: '', title: 'Custom embed', height: 260 },
    featured: true,
  },
  {
    id: 'custom-links',
    title: 'Custom links',
    description: 'A simple list of links you add yourself.',
    category: 'personal',
    icon: 'link',
    sizes: ['small', 'medium', 'wide'],
    defaultSize: 'medium',
    defaultSection: 'body',
    worksOffline: true,
    featured: true,
  },
];

export const WIDGET_IDS: string[] = WIDGETS.map((widget) => widget.id);

export type WidgetId = string;

const BY_ID = new Map(WIDGETS.map((widget) => [widget.id, widget]));

export function getWidget(id: string): WidgetDescriptor | undefined {
  return BY_ID.get(id);
}

export function widgetTitle(id: string): string {
  return getWidget(id)?.title ?? id;
}

export function isWidgetSize(value: unknown): value is WidgetSize {
  return value === 'small' || value === 'medium' || value === 'wide' || value === 'full';
}

export const WIDGET_SIZES: WidgetSize[] = ['small', 'medium', 'wide', 'full'];

export const WIDGET_SIZE_LABELS: Record<WidgetSize, string> = {
  small: 'Small',
  medium: 'Medium',
  wide: 'Wide',
  full: 'Full width',
};

/** Widgets that are switched on the first time someone opens Luma. */
export const FEATURED_WIDGET_IDS = WIDGETS.filter((widget) => widget.featured).map(
  (widget) => widget.id,
);
