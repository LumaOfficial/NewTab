import type { DashboardData, DashboardSettings, Note, Shortcut, Task } from '../storage/schema';
import { createDefaultDashboard } from '../storage/schema';
import type { WidgetId } from '../widgets/widgets';

export type DashboardAction =
  | { type: 'dashboard/hydrate'; data: DashboardData }
  | { type: 'dashboard/reset' }
  | { type: 'settings/patch'; patch: Partial<DashboardSettings> }
  | { type: 'widget/toggle'; id: WidgetId; visible: boolean }
  | { type: 'widget/move'; id: WidgetId; direction: -1 | 1 }
  | { type: 'shortcut/add'; shortcut: Shortcut }
  | { type: 'shortcut/update'; id: string; patch: Pick<Shortcut, 'title' | 'url'> }
  | { type: 'shortcut/delete'; id: string }
  | { type: 'shortcut/move'; id: string; direction: -1 | 1 }
  | { type: 'note/add'; note: Note }
  | { type: 'note/update'; id: string; patch: Pick<Note, 'title' | 'body'> }
  | { type: 'note/delete'; id: string }
  | { type: 'task/add'; task: Task }
  | { type: 'task/toggle'; id: string }
  | { type: 'task/update'; id: string; text: string }
  | { type: 'task/delete'; id: string }
  | { type: 'task/clearCompleted' };

/** Moves one item within a list, returning a new list. */
function moveById<T extends { id: string }>(items: T[], id: string, direction: -1 | 1): T[] {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return items;

  const target = index + direction;
  if (target < 0 || target >= items.length) return items;

  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

function moveWidget(order: WidgetId[], id: WidgetId, direction: -1 | 1): WidgetId[] {
  const index = order.indexOf(id);
  if (index === -1) return order;

  const target = index + direction;
  if (target < 0 || target >= order.length) return order;

  const next = [...order];
  next.splice(index, 1);
  next.splice(target, 0, id);
  return next;
}

export function dashboardReducer(state: DashboardData, action: DashboardAction): DashboardData {
  switch (action.type) {
    case 'dashboard/hydrate':
      return action.data;

    case 'dashboard/reset':
      return createDefaultDashboard();

    case 'settings/patch':
      return {
        ...state,
        settings: { ...state.settings, ...action.patch },
      };

    case 'widget/toggle': {
      const hidden = new Set(state.settings.hiddenWidgets);
      if (action.visible) {
        hidden.delete(action.id);
      } else {
        hidden.add(action.id);
      }
      return {
        ...state,
        settings: { ...state.settings, hiddenWidgets: Array.from(hidden) },
      };
    }

    case 'widget/move':
      return {
        ...state,
        settings: {
          ...state.settings,
          widgetOrder: moveWidget(state.settings.widgetOrder, action.id, action.direction),
        },
      };

    case 'shortcut/add':
      return { ...state, shortcuts: [...state.shortcuts, action.shortcut] };

    case 'shortcut/update':
      return {
        ...state,
        shortcuts: state.shortcuts.map((shortcut) =>
          shortcut.id === action.id ? { ...shortcut, ...action.patch } : shortcut,
        ),
      };

    case 'shortcut/delete':
      return {
        ...state,
        shortcuts: state.shortcuts.filter((shortcut) => shortcut.id !== action.id),
      };

    case 'shortcut/move':
      return {
        ...state,
        shortcuts: moveById(state.shortcuts, action.id, action.direction),
      };

    case 'note/add':
      return { ...state, notes: [action.note, ...state.notes] };

    case 'note/update':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.id
            ? { ...note, ...action.patch, updatedAt: Date.now() }
            : note,
        ),
      };

    case 'note/delete':
      return { ...state, notes: state.notes.filter((note) => note.id !== action.id) };

    case 'task/add':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'task/toggle':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task,
        ),
      };

    case 'task/update':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, text: action.text } : task,
        ),
      };

    case 'task/delete':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };

    case 'task/clearCompleted':
      return { ...state, tasks: state.tasks.filter((task) => !task.done) };

    default:
      return state;
  }
}
