import type {
  DashboardData,
  DashboardSettings,
  Note,
  Shortcut,
  Task,
  TrashEntry,
  TrashKind,
} from '../storage/schema';
import { createDefaultDashboard, TRASH_LIMIT } from '../storage/schema';
import { createId } from '../lib/utils';
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
  | { type: 'task/clearCompleted' }
  | { type: 'trash/restore'; id: string }
  | { type: 'trash/purge'; id: string }
  | { type: 'trash/empty' };

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

/** Moves an item into the trash, replacing any older copy of the same item. */
function pushTrash(
  trash: TrashEntry[],
  kind: TrashKind,
  itemId: string,
  label: string,
  item: TrashEntry['item'],
): TrashEntry[] {
  const entry: TrashEntry = {
    id: createId('trash'),
    kind,
    itemId,
    label: label.trim() || 'Untitled',
    deletedAt: Date.now(),
    item,
  };

  return [entry, ...trash.filter((existing) => !(existing.kind === kind && existing.itemId === itemId))]
    .slice(0, TRASH_LIMIT);
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

    case 'shortcut/delete': {
      const shortcut = state.shortcuts.find((entry) => entry.id === action.id);
      if (!shortcut) return state;

      return {
        ...state,
        shortcuts: state.shortcuts.filter((entry) => entry.id !== action.id),
        trash: pushTrash(state.trash, 'shortcut', shortcut.id, shortcut.title, shortcut),
      };
    }

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

    case 'note/delete': {
      const note = state.notes.find((entry) => entry.id === action.id);
      if (!note) return state;

      return {
        ...state,
        notes: state.notes.filter((entry) => entry.id !== action.id),
        trash: pushTrash(state.trash, 'note', note.id, note.title || 'Untitled note', note),
      };
    }

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

    case 'task/delete': {
      const task = state.tasks.find((entry) => entry.id === action.id);
      if (!task) return state;

      return {
        ...state,
        tasks: state.tasks.filter((entry) => entry.id !== action.id),
        trash: pushTrash(state.trash, 'task', task.id, task.text, task),
      };
    }

    case 'task/clearCompleted': {
      const completed = state.tasks.filter((task) => task.done);
      if (completed.length === 0) return state;

      const trash = completed.reduce(
        (list, task) => pushTrash(list, 'task', task.id, task.text, task),
        state.trash,
      );

      return { ...state, tasks: state.tasks.filter((task) => !task.done), trash };
    }

    case 'trash/restore': {
      const entry = state.trash.find((item) => item.id === action.id);
      if (!entry) return state;

      const trash = state.trash.filter((item) => item.id !== action.id);

      if (entry.kind === 'note') {
        const note = entry.item as Note;
        if (state.notes.some((existing) => existing.id === note.id)) return { ...state, trash };
        return { ...state, notes: [note, ...state.notes], trash };
      }

      if (entry.kind === 'task') {
        const task = entry.item as Task;
        if (state.tasks.some((existing) => existing.id === task.id)) return { ...state, trash };
        return { ...state, tasks: [...state.tasks, task], trash };
      }

      const shortcut = entry.item as Shortcut;
      if (state.shortcuts.some((existing) => existing.id === shortcut.id)) return { ...state, trash };
      return { ...state, shortcuts: [...state.shortcuts, shortcut], trash };
    }

    case 'trash/purge':
      return { ...state, trash: state.trash.filter((entry) => entry.id !== action.id) };

    case 'trash/empty':
      return { ...state, trash: [] };

    default:
      return state;
  }
}
