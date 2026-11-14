import type {
  CalendarEvent,
  CustomTheme,
  DashboardData,
  DashboardRoot,
  DashboardSettings,
  LayoutSettings,
  Note,
  SavedLayout,
  Shortcut,
  Task,
  ThemeRecipe,
  TrashEntry,
  TrashKind,
  Workspace,
  WorkspaceKind,
} from '../storage/schema';
import {
  createDefaultBackground,
  createDefaultDashboard,
  createDefaultSettings,
  createDefaultRoot,
  DATA_VERSION,
  SNAPSHOT_LIMIT,
  TRASH_LIMIT,
  type LayoutSnapshot,
} from '../storage/schema';
import { createId } from '../lib/utils';
import {
  getWidget,
  WIDGET_IDS,
  type WidgetId,
  type WidgetSection,
  type WidgetSize,
} from '../widgets/catalogue';
import { getLayoutPreset, type LayoutPresetId } from '../widgets/presets';
import { BUILT_IN_THEMES, getBuiltInTheme } from '../theme/themes';

export type DashboardAction =
  | { type: 'dashboard/hydrate-root'; root: DashboardRoot }
  | { type: 'dashboard/hydrate'; data: DashboardData }
  | { type: 'dashboard/reset' }
  | { type: 'settings/patch'; patch: Partial<DashboardSettings> }
  | { type: 'widget/toggle'; id: WidgetId; visible: boolean }
  | { type: 'widget/move'; id: WidgetId; direction: -1 | 1 }
  | { type: 'widget/state'; id: WidgetId; value: unknown }
  | { type: 'widget/settings'; id: WidgetId; patch: Record<string, unknown> }
  | { type: 'shortcut/add'; shortcut: Shortcut }
  | { type: 'shortcut/update'; id: string; patch: Pick<Shortcut, 'title' | 'url'> }
  | { type: 'shortcut/delete'; id: string }
  | { type: 'shortcut/move'; id: string; direction: -1 | 1 }
  | { type: 'note/add'; note: Note }
  | { type: 'note/update'; id: string; patch: Pick<Note, 'title' | 'body'> }
  | { type: 'note/pin'; id: string; pinned: boolean }
  | { type: 'note/delete'; id: string }
  | { type: 'task/add'; task: Task }
  | { type: 'task/toggle'; id: string }
  | { type: 'task/update'; id: string; text: string }
  | { type: 'task/due'; id: string; dueAt: string | null }
  | { type: 'task/delete'; id: string }
  | { type: 'task/clearCompleted' }
  | { type: 'event/add'; event: CalendarEvent }
  | { type: 'event/update'; id: string; patch: Partial<Omit<CalendarEvent, 'id'>> }
  | { type: 'event/delete'; id: string }
  | { type: 'trash/restore'; id: string }
  | { type: 'trash/purge'; id: string }
  | { type: 'trash/empty' }
  | { type: 'layout/toggle-lock' }
  | { type: 'layout/set-mode'; mode: LayoutSettings['mode'] }
  | { type: 'layout/apply-preset'; preset: LayoutPresetId }
  | { type: 'layout/move'; id: WidgetId; section: WidgetSection; index: number }
  | { type: 'layout/resize'; id: WidgetId; size: WidgetSize }
  | { type: 'layout/pin'; id: WidgetId; pinned: boolean }
  | { type: 'layout/reset' }
  | { type: 'layout/save'; name: string }
  | { type: 'layout/apply-saved'; id: string }
  | { type: 'layout/rename-saved'; id: string; name: string }
  | { type: 'layout/duplicate-saved'; id: string }
  | { type: 'layout/delete-saved'; id: string }
  | { type: 'layout/restore-previous' }
  | { type: 'workspace/create'; name: string; kind: WorkspaceKind; inheritTheme?: boolean }
  | { type: 'workspace/switch'; id: string }
  | { type: 'workspace/rename'; id: string; name: string }
  | { type: 'workspace/set-icon'; id: string; icon: string }
  | { type: 'workspace/duplicate'; id: string }
  | { type: 'workspace/delete'; id: string }
  | { type: 'workspace/reset'; id: string }
  | { type: 'theme/apply'; themeId: string }
  | { type: 'theme/reset' }
  | { type: 'theme/save-custom'; name: string; category: CustomTheme['category'] }
  | { type: 'theme/rename-custom'; id: string; name: string }
  | { type: 'theme/duplicate-custom'; id: string }
  | { type: 'theme/delete-custom'; id: string }
  | { type: 'onboarding/set'; status: 'pending' | 'completed' | 'skipped' };

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

/* ------------------------------------------------------------------------- *
 * Root helpers
 * ------------------------------------------------------------------------- */

export function activeWorkspaceOf(root: DashboardRoot): Workspace {
  return root.workspaces.find((workspace) => workspace.id === root.activeWorkspaceId) ?? root.workspaces[0];
}

export function activeDataOf(root: DashboardRoot): DashboardData {
  return activeWorkspaceOf(root).data;
}

function updateActive(root: DashboardRoot, updater: (data: DashboardData) => DashboardData): DashboardRoot {
  return {
    ...root,
    workspaces: root.workspaces.map((workspace) =>
      workspace.id === root.activeWorkspaceId
        ? { ...workspace, data: updater(workspace.data) }
        : workspace,
    ),
  };
}

function updateActiveLayout(
  root: DashboardRoot,
  updater: (data: DashboardData) => DashboardData,
): DashboardRoot {
  return updateActive(root, updater);
}

/** Widget order always lists every widget; layout entries lead the order. */
function orderFromLayout(layout: LayoutSettings): WidgetId[] {
  const seen = new Set<WidgetId>();
  const ordered: WidgetId[] = [];
  for (const entry of layout.entries) {
    if (!seen.has(entry.id)) {
      seen.add(entry.id);
      ordered.push(entry.id);
    }
  }
  for (const id of WIDGET_IDS) {
    if (!seen.has(id)) ordered.push(id);
  }
  return ordered;
}

function withLayout(data: DashboardData, layout: LayoutSettings): DashboardData {
  return {
    ...data,
    settings: { ...data.settings, layout, widgetOrder: orderFromLayout(layout) },
  };
}

function snapshotOf(data: DashboardData, label: string): LayoutSnapshot {
  return {
    id: createId('snapshot'),
    label,
    at: Date.now(),
    layout: data.settings.layout,
    widgetOrder: data.settings.widgetOrder,
    hiddenWidgets: data.settings.hiddenWidgets,
  };
}

/** Remember the current layout before it is replaced. */
function withSnapshot(root: DashboardRoot, label: string): DashboardRoot {
  return {
    ...root,
    workspaces: root.workspaces.map((workspace) =>
      workspace.id === root.activeWorkspaceId
        ? { ...workspace, history: [snapshotOf(workspace.data, label), ...workspace.history].slice(0, SNAPSHOT_LIMIT) }
        : workspace,
    ),
  };
}

function presetLayout(presetId: LayoutPresetId): { layout: LayoutSettings; hidden: WidgetId[] } {
  const preset = getLayoutPreset(presetId);
  const entries = preset.placements.flatMap((placement) => {
    const descriptor = getWidget(placement.id);
    if (!descriptor) return [];
    return [
      {
        id: placement.id,
        size: placement.size ?? descriptor.defaultSize,
        section: placement.section ?? descriptor.defaultSection,
        pinned: false,
      },
    ];
  });

  const visible = new Set(entries.map((entry) => entry.id));
  return {
    layout: { mode: 'preset', preset: preset.id, entries, locked: false },
    hidden: WIDGET_IDS.filter((id) => !visible.has(id)),
  };
}

function themeRecipeFromSettings(settings: DashboardSettings): ThemeRecipe {
  return {
    theme: settings.theme,
    accentColor: settings.surface.accentColor ?? getBuiltInTheme(settings.themeId).accent,
    textColor: settings.typography.textColor,
    background: settings.background,
    font: settings.typography.font,
    fontSize: settings.typography.size,
    widgetOpacity: settings.surface.opacity,
    widgetBlur: settings.surface.blur,
    radius: settings.surface.radius,
    shadow: settings.surface.shadow,
    animation: settings.motion.animation,
    density: settings.motion.density,
  };
}

function applyTheme(settings: DashboardSettings, themeId: string, customThemes: CustomTheme[]): DashboardSettings {
  const custom = customThemes.find((theme) => theme.id === themeId);

  if (custom) {
    const recipe = custom.recipe;
    return {
      ...settings,
      theme: recipe.theme,
      themeId: custom.id,
      background: { ...recipe.background },
      typography: {
        ...settings.typography,
        font: recipe.font,
        size: recipe.fontSize,
        textColor: recipe.textColor,
      },
      surface: {
        ...settings.surface,
        accentColor: recipe.accentColor,
        opacity: recipe.widgetOpacity,
        blur: recipe.widgetBlur,
        radius: recipe.radius,
        shadow: recipe.shadow,
      },
      motion: { ...settings.motion, animation: recipe.animation, density: recipe.density },
    };
  }

  const theme = getBuiltInTheme(themeId);
  return {
    ...settings,
    theme: theme.mode,
    themeId: theme.id,
    background: { ...theme.background },
    typography: { ...settings.typography, font: theme.font ?? 'sans' },
    surface: { ...settings.surface, accentColor: null },
  };
}

function createWorkspaceFrom(
  name: string,
  kind: WorkspaceKind,
  source?: DashboardData,
  icon = '◆',
): Workspace {
  return {
    id: createId('workspace'),
    name: name.trim().slice(0, 40) || 'Workspace',
    icon: icon.slice(0, 4) || '◆',
    kind,
    createdAt: Date.now(),
    data: source ? (JSON.parse(JSON.stringify(source)) as DashboardData) : createDefaultDashboard(),
    history: [],
  };
}

const WORKSPACE_ICONS: Record<string, string> = {
  personal: '◆',
  school: '◆',
  work: '▲',
  custom: '●',
  guest: '○',
};

/* ------------------------------------------------------------------------- *
 * Reducer
 * ------------------------------------------------------------------------- */

export function dashboardReducer(root: DashboardRoot, action: DashboardAction): DashboardRoot {
  switch (action.type) {
    case 'dashboard/hydrate-root':
      return action.root;

    case 'dashboard/hydrate':
      return updateActive(root, () => action.data);

    case 'dashboard/reset':
      return updateActive(root, () => createDefaultDashboard());

    case 'settings/patch':
      return updateActive(root, (data) => ({
        ...data,
        settings: { ...data.settings, ...action.patch },
      }));

    case 'widget/toggle': {
      return updateActive(root, (data) => {
        const hidden = new Set(data.settings.hiddenWidgets);
        let entries = data.settings.layout.entries;

        if (action.visible) {
          hidden.delete(action.id);
          if (!entries.some((entry) => entry.id === action.id)) {
            const descriptor = getWidget(action.id);
            if (descriptor) {
              entries = [
                ...entries,
                {
                  id: action.id,
                  size: descriptor.defaultSize,
                  section: descriptor.defaultSection,
                  pinned: false,
                },
              ];
            }
          }
        } else {
          hidden.add(action.id);
        }

        return withLayout(
          { ...data, settings: { ...data.settings, hiddenWidgets: Array.from(hidden) } },
          { ...data.settings.layout, entries },
        );
      });
    }

    case 'widget/move': {
      const layout = activeDataOf(root).settings.layout;
      const index = layout.entries.findIndex((entry) => entry.id === action.id);
      if (index === -1) {
        return updateActive(root, (data) => ({
          ...data,
          settings: { ...data.settings, widgetOrder: moveWidget(data.settings.widgetOrder, action.id, action.direction) },
        }));
      }

      const target = index + action.direction;
      if (target < 0 || target >= layout.entries.length) return root;
      const entries = [...layout.entries];
      const [moved] = entries.splice(index, 1);
      entries.splice(target, 0, moved);

      return updateActiveLayout(root, (data) =>
        withLayout({ ...data, settings: { ...data.settings, hiddenWidgets: data.settings.hiddenWidgets } }, {
          ...layout,
          entries,
        }),
      );
    }

    case 'widget/state':
      return updateActive(root, (data) => ({
        ...data,
        widgetState: { ...data.widgetState, [action.id]: action.value },
      }));

    case 'widget/settings':
      return updateActive(root, (data) => ({
        ...data,
        settings: {
          ...data.settings,
          widgetSettings: {
            ...data.settings.widgetSettings,
            [action.id]: { ...(data.settings.widgetSettings[action.id] ?? {}), ...action.patch },
          },
        },
      }));

    case 'shortcut/add':
      return updateActive(root, (data) => ({ ...data, shortcuts: [...data.shortcuts, action.shortcut] }));

    case 'shortcut/update':
      return updateActive(root, (data) => ({
        ...data,
        shortcuts: data.shortcuts.map((shortcut) =>
          shortcut.id === action.id ? { ...shortcut, ...action.patch } : shortcut,
        ),
      }));

    case 'shortcut/delete':
      return updateActive(root, (data) => {
        const shortcut = data.shortcuts.find((entry) => entry.id === action.id);
        if (!shortcut) return data;
        return {
          ...data,
          shortcuts: data.shortcuts.filter((entry) => entry.id !== action.id),
          trash: pushTrash(data.trash, 'shortcut', shortcut.id, shortcut.title, shortcut),
        };
      });

    case 'shortcut/move':
      return updateActive(root, (data) => ({
        ...data,
        shortcuts: moveById(data.shortcuts, action.id, action.direction),
      }));

    case 'note/add':
      return updateActive(root, (data) => ({ ...data, notes: [action.note, ...data.notes] }));

    case 'note/update':
      return updateActive(root, (data) => ({
        ...data,
        notes: data.notes.map((note) =>
          note.id === action.id ? { ...note, ...action.patch, updatedAt: Date.now() } : note,
        ),
      }));

    case 'note/pin':
      return updateActive(root, (data) => ({
        ...data,
        notes: data.notes.map((note) =>
          note.id === action.id ? { ...note, pinned: action.pinned, updatedAt: Date.now() } : note,
        ),
      }));

    case 'note/delete':
      return updateActive(root, (data) => {
        const note = data.notes.find((entry) => entry.id === action.id);
        if (!note) return data;
        return {
          ...data,
          notes: data.notes.filter((entry) => entry.id !== action.id),
          trash: pushTrash(data.trash, 'note', note.id, note.title || 'Untitled note', note),
        };
      });

    case 'task/add':
      return updateActive(root, (data) => ({ ...data, tasks: [...data.tasks, action.task] }));

    case 'task/toggle':
      return updateActive(root, (data) => ({
        ...data,
        tasks: data.tasks.map((task) =>
          task.id === action.id
            ? { ...task, done: !task.done, completedAt: task.done ? null : Date.now() }
            : task,
        ),
      }));

    case 'task/update':
      return updateActive(root, (data) => ({
        ...data,
        tasks: data.tasks.map((task) => (task.id === action.id ? { ...task, text: action.text } : task)),
      }));

    case 'task/due':
      return updateActive(root, (data) => ({
        ...data,
        tasks: data.tasks.map((task) => (task.id === action.id ? { ...task, dueAt: action.dueAt } : task)),
      }));

    case 'task/delete':
      return updateActive(root, (data) => {
        const task = data.tasks.find((entry) => entry.id === action.id);
        if (!task) return data;
        return {
          ...data,
          tasks: data.tasks.filter((entry) => entry.id !== action.id),
          trash: pushTrash(data.trash, 'task', task.id, task.text, task),
        };
      });

    case 'task/clearCompleted':
      return updateActive(root, (data) => {
        const completed = data.tasks.filter((task) => task.done);
        if (completed.length === 0) return data;
        const trash = completed.reduce(
          (list, task) => pushTrash(list, 'task', task.id, task.text, task),
          data.trash,
        );
        return { ...data, tasks: data.tasks.filter((task) => !task.done), trash };
      });

    case 'event/add':
      return updateActive(root, (data) => ({
        ...data,
        events: [...data.events, action.event].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
      }));

    case 'event/update':
      return updateActive(root, (data) => ({
        ...data,
        events: data.events
          .map((event) => (event.id === action.id ? { ...event, ...action.patch } : event))
          .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
      }));

    case 'event/delete':
      return updateActive(root, (data) => ({
        ...data,
        events: data.events.filter((event) => event.id !== action.id),
      }));

    case 'trash/restore':
      return updateActive(root, (data) => {
        const entry = data.trash.find((item) => item.id === action.id);
        if (!entry) return data;
        const trash = data.trash.filter((item) => item.id !== action.id);

        if (entry.kind === 'note') {
          const note = entry.item as Note;
          if (data.notes.some((existing) => existing.id === note.id)) return { ...data, trash };
          return { ...data, notes: [note, ...data.notes], trash };
        }

        if (entry.kind === 'task') {
          const task = entry.item as Task;
          if (data.tasks.some((existing) => existing.id === task.id)) return { ...data, trash };
          return { ...data, tasks: [...data.tasks, task], trash };
        }

        const shortcut = entry.item as Shortcut;
        if (data.shortcuts.some((existing) => existing.id === shortcut.id)) return { ...data, trash };
        return { ...data, shortcuts: [...data.shortcuts, shortcut], trash };
      });

    case 'trash/purge':
      return updateActive(root, (data) => ({
        ...data,
        trash: data.trash.filter((entry) => entry.id !== action.id),
      }));

    case 'trash/empty':
      return updateActive(root, (data) => ({ ...data, trash: [] }));

    case 'layout/toggle-lock':
      return updateActive(root, (data) =>
        withLayout(data, { ...data.settings.layout, locked: !data.settings.layout.locked }),
      );

    case 'layout/set-mode':
      return updateActive(root, (data) =>
        withLayout(data, { ...data.settings.layout, mode: action.mode }),
      );

    case 'layout/apply-preset': {
      const { layout, hidden } = presetLayout(action.preset);
      const snapshotted = withSnapshot(root, `Before “${getLayoutPreset(action.preset).label}”`);
      return updateActive(snapshotted, (data) =>
        withLayout({ ...data, settings: { ...data.settings, hiddenWidgets: hidden } }, layout),
      );
    }

    case 'layout/move': {
      const current = activeDataOf(root).settings.layout;
      if (current.locked) return root;
      const moving = current.entries.find((entry) => entry.id === action.id);
      if (!moving) return root;

      const rest = current.entries.filter((entry) => entry.id !== action.id);
      const targets = rest.filter((entry) => entry.section === action.section);
      const clamped = Math.max(0, Math.min(action.index, targets.length));
      const nextTarget = { ...moving, section: action.section };

      let inserted = false;
      const entries = rest.flatMap((entry) => {
        if (entry.section === action.section && !inserted && targets[clamped]?.id === entry.id) {
          inserted = true;
          return [nextTarget, entry];
        }
        return [entry];
      });
      if (!inserted) entries.push(nextTarget);

      return updateActive(root, (data) =>
        withLayout(data, { ...current, mode: 'custom', entries }),
      );
    }

    case 'layout/resize': {
      const current = activeDataOf(root).settings.layout;
      if (current.locked) return root;
      const descriptor = getWidget(action.id);
      if (!descriptor) return root;
      const size = descriptor.sizes.includes(action.size) ? action.size : descriptor.defaultSize;

      return updateActive(root, (data) =>
        withLayout(data, {
          ...current,
          mode: 'custom',
          entries: current.entries.map((entry) =>
            entry.id === action.id ? { ...entry, size } : entry,
          ),
        }),
      );
    }

    case 'layout/pin': {
      const current = activeDataOf(root).settings.layout;
      return updateActive(root, (data) =>
        withLayout(data, {
          ...current,
          entries: current.entries.map((entry) =>
            entry.id === action.id ? { ...entry, pinned: action.pinned } : entry,
          ),
        }),
      );
    }

    case 'layout/reset': {
      const snapshotted = withSnapshot(root, 'Before layout reset');
      const { layout, hidden } = presetLayout('complete');
      return updateActive(snapshotted, (data) =>
        withLayout({ ...data, settings: { ...data.settings, hiddenWidgets: hidden } }, layout),
      );
    }

    case 'layout/save': {
      const data = activeDataOf(root);
      const saved: SavedLayout = {
        id: createId('layout'),
        name: action.name.trim().slice(0, 40) || 'Saved layout',
        createdAt: Date.now(),
        layout: data.settings.layout,
        widgetOrder: data.settings.widgetOrder,
        hiddenWidgets: data.settings.hiddenWidgets,
      };
      return { ...root, savedLayouts: [saved, ...root.savedLayouts] };
    }

    case 'layout/apply-saved': {
      const saved = root.savedLayouts.find((entry) => entry.id === action.id);
      if (!saved) return root;
      const snapshotted = withSnapshot(root, 'Before saved layout');
      return updateActive(snapshotted, (data) =>
        withLayout(
          { ...data, settings: { ...data.settings, hiddenWidgets: [...saved.hiddenWidgets] } },
          { ...saved.layout, mode: 'custom' },
        ),
      );
    }

    case 'layout/rename-saved':
      return {
        ...root,
        savedLayouts: root.savedLayouts.map((entry) =>
          entry.id === action.id
            ? { ...entry, name: action.name.trim().slice(0, 40) || entry.name }
            : entry,
        ),
      };

    case 'layout/duplicate-saved': {
      const saved = root.savedLayouts.find((entry) => entry.id === action.id);
      if (!saved) return root;
      return {
        ...root,
        savedLayouts: [
          {
            ...saved,
            id: createId('layout'),
            name: `${saved.name} copy`.slice(0, 40),
            createdAt: Date.now(),
          },
          ...root.savedLayouts,
        ],
      };
    }

    case 'layout/delete-saved':
      return { ...root, savedLayouts: root.savedLayouts.filter((entry) => entry.id !== action.id) };

    case 'layout/restore-previous': {
      const workspace = activeWorkspaceOf(root);
      const previous = workspace.history[0];
      if (!previous) return root;
      return {
        ...root,
        workspaces: root.workspaces.map((entry) =>
          entry.id === workspace.id
            ? {
                ...entry,
                history: entry.history.slice(1),
                data: withLayout(
                  { ...entry.data, settings: { ...entry.data.settings, hiddenWidgets: [...previous.hiddenWidgets] } },
                  previous.layout,
                ),
              }
            : entry,
        ),
      };
    }

    case 'workspace/create': {
      const active = activeWorkspaceOf(root);
      const workspace = createWorkspaceFrom(
        action.name,
        action.kind,
        action.inheritTheme ? { ...active.data, notes: [], tasks: [], shortcuts: [], events: [], trash: [] } : undefined,
        WORKSPACE_ICONS[action.kind] ?? '◆',
      );
      return {
        ...root,
        activeWorkspaceId: workspace.id,
        workspaces: [...root.workspaces, workspace],
      };
    }

    case 'workspace/switch':
      return root.workspaces.some((workspace) => workspace.id === action.id)
        ? { ...root, activeWorkspaceId: action.id }
        : root;

    case 'workspace/rename':
      return {
        ...root,
        workspaces: root.workspaces.map((workspace) =>
          workspace.id === action.id
            ? { ...workspace, name: action.name.trim().slice(0, 40) || workspace.name }
            : workspace,
        ),
      };

    case 'workspace/set-icon':
      return {
        ...root,
        workspaces: root.workspaces.map((workspace) =>
          workspace.id === action.id
            ? { ...workspace, icon: action.icon.trim().slice(0, 4) || workspace.icon }
            : workspace,
        ),
      };

    case 'workspace/duplicate': {
      const source = root.workspaces.find((workspace) => workspace.id === action.id);
      if (!source) return root;
      const copy = createWorkspaceFrom(`${source.name} copy`, source.kind, source.data, source.icon);
      const index = root.workspaces.findIndex((workspace) => workspace.id === action.id);
      const workspaces = [...root.workspaces];
      workspaces.splice(index + 1, 0, copy);
      return { ...root, workspaces, activeWorkspaceId: copy.id };
    }

    case 'workspace/delete': {
      if (root.workspaces.length <= 1) return root;
      const remaining = root.workspaces.filter((workspace) => workspace.id !== action.id);
      if (remaining.length === root.workspaces.length) return root;
      const activeWorkspaceId =
        root.activeWorkspaceId === action.id ? remaining[0].id : root.activeWorkspaceId;
      return { ...root, workspaces: remaining, activeWorkspaceId };
    }

    case 'workspace/reset':
      return {
        ...root,
        workspaces: root.workspaces.map((workspace) =>
          workspace.id === action.id
            ? { ...workspace, data: createDefaultDashboard(), history: [] }
            : workspace,
        ),
      };

    case 'theme/apply':
      return updateActive(root, (data) => ({
        ...data,
        settings: applyTheme(data.settings, action.themeId, root.customThemes),
      }));

    case 'theme/reset': {
      const defaults = createDefaultSettings();
      return updateActive(root, (data) => ({
        ...data,
        settings: {
          ...data.settings,
          theme: defaults.theme,
          themeId: defaults.themeId,
          background: createDefaultBackground(),
          typography: defaults.typography,
          surface: { ...defaults.surface },
          motion: defaults.motion,
        },
      }));
    }

    case 'theme/save-custom': {
      const data = activeDataOf(root);
      const id = createId('theme');
      const custom: CustomTheme = {
        id,
        name: action.name.trim().slice(0, 40) || 'My theme',
        category: action.category,
        baseThemeId:
          root.customThemes.find((theme) => theme.id === data.settings.themeId)?.baseThemeId ??
          getBuiltInTheme(data.settings.themeId).id,
        recipe: themeRecipeFromSettings(data.settings),
        createdAt: Date.now(),
      };
      return {
        ...updateActive(root, (workspaceData) => ({
          ...workspaceData,
          settings: { ...workspaceData.settings, themeId: id },
        })),
        customThemes: [custom, ...root.customThemes],
      };
    }

    case 'theme/rename-custom':
      return {
        ...root,
        customThemes: root.customThemes.map((theme) =>
          theme.id === action.id
            ? { ...theme, name: action.name.trim().slice(0, 40) || theme.name }
            : theme,
        ),
      };

    case 'theme/duplicate-custom': {
      const theme = root.customThemes.find((entry) => entry.id === action.id);
      if (!theme) return root;
      return {
        ...root,
        customThemes: [
          {
            ...theme,
            id: createId('theme'),
            name: `${theme.name} copy`.slice(0, 40),
            createdAt: Date.now(),
          },
          ...root.customThemes,
        ],
      };
    }

    case 'theme/delete-custom': {
      const removing = root.customThemes.some((theme) => theme.id === action.id);
      const customThemes = root.customThemes.filter((theme) => theme.id !== action.id);
      const workspaces = root.workspaces.map((workspace) =>
        workspace.data.settings.themeId === action.id
          ? {
              ...workspace,
              data: {
                ...workspace.data,
                settings: {
                  ...workspace.data.settings,
                  themeId: removing ? BUILT_IN_THEMES[0].id : workspace.data.settings.themeId,
                },
              },
            }
          : workspace,
      );
      return { ...root, customThemes, workspaces };
    }

    case 'onboarding/set':
      return {
        ...root,
        onboarding: {
          status: action.status,
          completedAt: action.status === 'pending' ? null : Date.now(),
        },
      };

    default:
      return root;
  }
}

/** Only used by tests and a hard reset from settings. */
export function freshRoot(): DashboardRoot {
  return { ...createDefaultRoot(), version: DATA_VERSION };
}

/** Re-exported so settings components can type a reset target. */
export type { LayoutSnapshot };
