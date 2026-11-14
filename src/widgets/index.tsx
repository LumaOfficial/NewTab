import type { WidgetComponentMap } from './types';
import { ClockWidget } from './ClockWidget';
import { GreetingWidget } from './GreetingWidget';
import { SearchWidget } from './SearchWidget';
import { ShortcutsWidget } from './ShortcutsWidget';
import { NotesWidget } from './NotesWidget';
import { TasksWidget } from './TasksWidget';

/**
 * Widget id → component. The dashboard renders only what is in this map, so
 * adding a widget is: describe it in `widgets.ts`, add a component, register it
 * here. Stored dashboards pick up new ids automatically.
 */
export const WIDGET_COMPONENTS: WidgetComponentMap = {
  clock: ClockWidget,
  greeting: GreetingWidget,
  search: SearchWidget,
  shortcuts: ShortcutsWidget,
  notes: NotesWidget,
  tasks: TasksWidget,
};
