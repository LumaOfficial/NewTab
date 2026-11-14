import { lazy, type ComponentType } from 'react';
import type { WidgetComponent, WidgetComponentMap } from './types';
import { ClockWidget } from './ClockWidget';
import { GreetingWidget } from './GreetingWidget';
import { SearchWidget } from './SearchWidget';
import { ShortcutsWidget } from './ShortcutsWidget';
import { NotesWidget } from './NotesWidget';
import { TasksWidget } from './TasksWidget';

/**
 * Widget id → component.
 *
 * The starter widgets load with the dashboard. Everything added in the widget
 * library loads on demand, the first time it is actually rendered, so a large
 * dashboard does not pay for widgets the user never opens.
 */
function load(loader: () => Promise<{ default: WidgetComponent }>): WidgetComponent {
  return lazy(loader) as unknown as WidgetComponent;
}

const productivity = {
  subtasks: load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.SubtasksWidget })),
  ),
  'pinned-notes': load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.PinnedNotesWidget })),
  ),
  'focus-timer': load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.FocusTimerWidget })),
  ),
  pomodoro: load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.PomodoroWidget })),
  ),
  habits: load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.HabitsWidget })),
  ),
  'daily-goals': load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.DailyGoalsWidget })),
  ),
  reminders: load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.RemindersWidget })),
  ),
  'daily-briefing': load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({
      default: module.DailyBriefingWidget,
    })),
  ),
  'productivity-analytics': load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({
      default: module.ProductivityAnalyticsWidget,
    })),
  ),
  kanban: load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.KanbanWidget })),
  ),
  'ai-plan': load(() =>
    import('./productivity/ProductivityWidgets').then((module) => ({ default: module.AiPlanWidget })),
  ),
};

const time = {
  date: load(() => import('./time/TimeWidgets').then((module) => ({ default: module.DateWidget }))),
  'world-clocks': load(() =>
    import('./time/TimeWidgets').then((module) => ({ default: module.WorldClocksWidget })),
  ),
  countdown: load(() =>
    import('./time/TimeWidgets').then((module) => ({ default: module.CountdownWidget })),
  ),
  'calendar-agenda': load(() =>
    import('./time/TimeWidgets').then((module) => ({ default: module.CalendarAgendaWidget })),
  ),
  'upcoming-events': load(() =>
    import('./time/TimeWidgets').then((module) => ({ default: module.UpcomingEventsWidget })),
  ),
  birthdays: load(() =>
    import('./time/TimeWidgets').then((module) => ({ default: module.BirthdaysWidget })),
  ),
  'deadline-reminders': load(() =>
    import('./time/TimeWidgets').then((module) => ({ default: module.DeadlineRemindersWidget })),
  ),
};

const navigation = {
  bookmarks: load(() =>
    import('./navigation/NavigationWidgets').then((module) => ({ default: module.BookmarksWidget })),
  ),
  'recent-visits': load(() =>
    import('./navigation/NavigationWidgets').then((module) => ({
      default: module.RecentVisitsWidget,
    })),
  ),
  'open-tabs': load(() =>
    import('./navigation/NavigationWidgets').then((module) => ({ default: module.OpenTabsWidget })),
  ),
  'tab-search': load(() =>
    import('./navigation/NavigationWidgets').then((module) => ({ default: module.TabSearchWidget })),
  ),
  'closed-tabs': load(() =>
    import('./navigation/NavigationWidgets').then((module) => ({ default: module.ClosedTabsWidget })),
  ),
  'saved-sessions': load(() =>
    import('./navigation/NavigationWidgets').then((module) => ({
      default: module.SavedSessionsWidget,
    })),
  ),
  extensions: load(() =>
    import('./navigation/NavigationWidgets').then((module) => ({ default: module.ExtensionsWidget })),
  ),
};

const media = {
  spotify: load(() =>
    import('./media/MediaWidgets').then((module) => ({ default: module.MediaIntegrationWidget })),
  ),
  'youtube-music': load(() =>
    import('./media/MediaWidgets').then((module) => ({ default: module.MediaIntegrationWidget })),
  ),
  podcast: load(() =>
    import('./media/MediaWidgets').then((module) => ({ default: module.MediaIntegrationWidget })),
  ),
  'mini-player': load(() =>
    import('./media/MediaWidgets').then((module) => ({ default: module.MediaIntegrationWidget })),
  ),
  'recent-media': load(() =>
    import('./media/MediaWidgets').then((module) => ({ default: module.MediaIntegrationWidget })),
  ),
  volume: load(() =>
    import('./media/MediaWidgets').then((module) => ({ default: module.VolumeWidget })),
  ),
};

const information = {
  weather: load(() =>
    import('./information/InformationWidgets').then((module) => ({
      default: module.InformationIntegrationWidget,
    })),
  ),
  news: load(() =>
    import('./information/InformationWidgets').then((module) => ({
      default: module.InformationIntegrationWidget,
    })),
  ),
  rss: load(() =>
    import('./information/InformationWidgets').then((module) => ({ default: module.RssWidget })),
  ),
  stocks: load(() =>
    import('./information/InformationWidgets').then((module) => ({
      default: module.InformationIntegrationWidget,
    })),
  ),
  crypto: load(() =>
    import('./information/InformationWidgets').then((module) => ({
      default: module.InformationIntegrationWidget,
    })),
  ),
  sports: load(() =>
    import('./information/InformationWidgets').then((module) => ({
      default: module.InformationIntegrationWidget,
    })),
  ),
  transit: load(() =>
    import('./information/InformationWidgets').then((module) => ({
      default: module.InformationIntegrationWidget,
    })),
  ),
};

const browser = {
  downloads: load(() =>
    import('./browser/BrowserWidgets').then((module) => ({ default: module.BrowserPermissionWidget })),
  ),
  'browser-settings': load(() =>
    import('./browser/BrowserWidgets').then((module) => ({ default: module.BrowserSettingsWidget })),
  ),
  incognito: load(() =>
    import('./browser/BrowserWidgets').then((module) => ({ default: module.IncognitoWidget })),
  ),
  'tab-cleanup': load(() =>
    import('./browser/BrowserWidgets').then((module) => ({ default: module.BrowserPermissionWidget })),
  ),
  'duplicate-tabs': load(() =>
    import('./browser/BrowserWidgets').then((module) => ({ default: module.DuplicateTabsWidget })),
  ),
  battery: load(() =>
    import('./browser/BrowserWidgets').then((module) => ({ default: module.BatteryWidget })),
  ),
  network: load(() =>
    import('./browser/BrowserWidgets').then((module) => ({ default: module.NetworkWidget })),
  ),
};

const personal = {
  'email-preview': load(() =>
    import('./personal/PersonalWidgets').then((module) => ({
      default: module.PersonalIntegrationWidget,
    })),
  ),
  'unread-email': load(() =>
    import('./personal/PersonalWidgets').then((module) => ({
      default: module.PersonalIntegrationWidget,
    })),
  ),
  contacts: load(() =>
    import('./personal/PersonalWidgets').then((module) => ({
      default: module.PersonalIntegrationWidget,
    })),
  ),
  messaging: load(() =>
    import('./personal/PersonalWidgets').then((module) => ({ default: module.MessagingWidget })),
  ),
  embed: load(() =>
    import('./personal/PersonalWidgets').then((module) => ({ default: module.EmbedWidget })),
  ),
  'custom-links': load(() =>
    import('./personal/PersonalWidgets').then((module) => ({ default: module.CustomLinksWidget })),
  ),
};

export const WIDGET_COMPONENTS: WidgetComponentMap = {
  clock: ClockWidget,
  greeting: GreetingWidget,
  search: SearchWidget,
  shortcuts: ShortcutsWidget,
  notes: NotesWidget,
  tasks: TasksWidget,
  ...productivity,
  ...time,
  ...navigation,
  ...media,
  ...information,
  ...browser,
  ...personal,
};

export function widgetComponent(id: string): ComponentType<import('./types').WidgetProps> | null {
  return WIDGET_COMPONENTS[id] ?? null;
}
