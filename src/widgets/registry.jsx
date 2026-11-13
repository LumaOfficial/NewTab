import { ClockWidget } from './ClockWidget.jsx';
import { GreetingWidget } from './GreetingWidget.jsx';
import { NotesWidget } from './NotesWidget.jsx';
import { SearchWidget } from './SearchWidget.jsx';
import { ShortcutsWidget } from './ShortcutsWidget.jsx';
import { TasksWidget } from './TasksWidget.jsx';

/**
 * The widget registry is the single place that maps a layout id to a
 * component. Adding a widget means adding an entry here (and its id to
 * `WIDGET_IDS` in lib/defaults.js); the dashboard, settings list and storage
 * normalization all pick it up automatically.
 *
 * `span` is how many of the grid's six columns the widget covers.
 */
export const WIDGETS = {
  clock: {
    id: 'clock',
    title: 'Clock',
    description: 'The time and today’s date, at a glance.',
    span: 3,
    Component: ClockWidget,
  },
  greeting: {
    id: 'greeting',
    title: 'Greeting',
    description: 'A personal hello that follows the time of day.',
    span: 3,
    Component: GreetingWidget,
  },
  search: {
    id: 'search',
    title: 'Search',
    description: 'Search the web or jump to an address.',
    span: 6,
    Component: SearchWidget,
  },
  shortcuts: {
    id: 'shortcuts',
    title: 'Shortcuts',
    description: 'Quick links to the sites you use most.',
    span: 6,
    Component: ShortcutsWidget,
  },
  notes: {
    id: 'notes',
    title: 'Notes',
    description: 'Quick scratch notes saved in this browser.',
    span: 3,
    Component: NotesWidget,
  },
  tasks: {
    id: 'tasks',
    title: 'Tasks',
    description: 'A simple checklist for the day.',
    span: 3,
    Component: TasksWidget,
  },
};
