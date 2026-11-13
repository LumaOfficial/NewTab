import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { LIMITS, createDefaultState } from '../lib/defaults.js';
import { createId } from '../lib/id.js';
import { normalizeState } from '../lib/normalize.js';
import { moveById } from '../lib/ordering.js';
import { clearDashboard, describeStorageError, readDashboard, writeDashboard } from '../lib/storage.js';
import { hostnameLabel, normalizeShortcutUrl } from '../lib/url.js';

const DashboardContext = createContext(null);

const SAVE_DELAY = 250;

/**
 * Owns the dashboard state and every mutation.
 *
 * Widgets only talk to this provider, so adding a widget never means touching
 * storage code, and every change is normalized + persisted the same way.
 */
export function DashboardProvider({ children }) {
  const [state, setState] = useState(null);
  const [storageError, setStorageError] = useState(null);
  const [panel, setPanel] = useState({ open: false, section: 'appearance' });
  const lastSaved = useRef(null);

  // Load once. Invalid or unreadable data falls back to defaults with a notice.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await readDashboard();
        if (cancelled) return;
        const normalized = normalizeState(stored);
        lastSaved.current = JSON.stringify(normalized);
        setState(normalized);
      } catch (error) {
        if (cancelled) return;
        setStorageError(describeStorageError(error));
        setState(createDefaultState());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Apply the theme before paint so switching never flashes.
  useLayoutEffect(() => {
    if (!state) return undefined;
    const mode = state.settings.theme;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const resolved = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };

    apply();
    if (mode !== 'system') return undefined;

    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [state?.settings.theme]);

  // Debounced save of every change after the initial load.
  useEffect(() => {
    if (!state) return undefined;

    const serialized = JSON.stringify(state);
    if (serialized === lastSaved.current) return undefined;

    const timer = setTimeout(async () => {
      try {
        await writeDashboard(state);
        lastSaved.current = serialized;
        setStorageError(null);
      } catch (error) {
        setStorageError(describeStorageError(error));
      }
    }, SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [state]);

  const updateSettings = useCallback((patch) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const setTheme = useCallback((theme) => updateSettings({ theme }), [updateSettings]);

  const openSettings = useCallback((section = 'appearance') => {
    setPanel({ open: true, section });
  }, []);

  const closeSettings = useCallback(() => {
    setPanel((prev) => ({ ...prev, open: false }));
  }, []);

  const setSettingsSection = useCallback((section) => {
    setPanel((prev) => ({ ...prev, section }));
  }, []);

  const dismissStorageError = useCallback(() => setStorageError(null), []);

  const addShortcut = useCallback(
    ({ label, url }) => {
      const normalizedUrl = normalizeShortcutUrl(url);
      if (!normalizedUrl) return { ok: false, error: 'Enter a valid web address, like example.com.' };
      if (state.shortcuts.length >= LIMITS.shortcuts) {
        return { ok: false, error: `You can keep up to ${LIMITS.shortcuts} shortcuts.` };
      }

      const shortcut = {
        id: createId('sc'),
        label: String(label ?? '').trim().slice(0, LIMITS.shortcutLabel) || hostnameLabel(normalizedUrl),
        url: normalizedUrl,
      };
      setState((prev) => ({ ...prev, shortcuts: [...prev.shortcuts, shortcut] }));
      return { ok: true, shortcut };
    },
    [state?.shortcuts.length],
  );

  const updateShortcut = useCallback((id, { label, url }) => {
    const normalizedUrl = normalizeShortcutUrl(url);
    if (!normalizedUrl) return { ok: false, error: 'Enter a valid web address, like example.com.' };

    setState((prev) => ({
      ...prev,
      shortcuts: prev.shortcuts.map((shortcut) =>
        shortcut.id === id
          ? {
              ...shortcut,
              label: String(label ?? '').trim().slice(0, LIMITS.shortcutLabel) || hostnameLabel(normalizedUrl),
              url: normalizedUrl,
            }
          : shortcut,
      ),
    }));
    return { ok: true };
  }, []);

  const removeShortcut = useCallback((id) => {
    setState((prev) => ({ ...prev, shortcuts: prev.shortcuts.filter((shortcut) => shortcut.id !== id) }));
  }, []);

  const moveShortcut = useCallback((id, direction) => {
    setState((prev) => ({ ...prev, shortcuts: moveById(prev.shortcuts, id, direction) }));
  }, []);

  const setWidgetVisible = useCallback((id, visible) => {
    setState((prev) => {
      const hidden = visible ? prev.layout.hidden.filter((widgetId) => widgetId !== id) : [...prev.layout.hidden.filter((widgetId) => widgetId !== id), id];
      return { ...prev, layout: { ...prev.layout, hidden } };
    });
  }, []);

  const hideWidget = useCallback((id) => setWidgetVisible(id, false), [setWidgetVisible]);

  const moveWidget = useCallback((id, direction) => {
    setState((prev) => ({
      ...prev,
      layout: { ...prev.layout, order: moveById(prev.layout.order, id, direction) },
    }));
  }, []);

  const addTask = useCallback(
    (text) => {
      const clean = String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, LIMITS.task);
      if (!clean) return { ok: false, error: 'Write something to do first.' };
      if (state.tasks.length >= LIMITS.tasks) return { ok: false, error: `You can keep up to ${LIMITS.tasks} tasks.` };

      setState((prev) => ({ ...prev, tasks: [{ id: createId('tk'), text: clean, done: false, createdAt: Date.now() }, ...prev.tasks] }));
      return { ok: true };
    },
    [state?.tasks.length],
  );

  const toggleTask = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    }));
  }, []);

  const updateTask = useCallback((id, text) => {
    const clean = String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, LIMITS.task);
    if (!clean) return { ok: false, error: 'A task cannot be empty.' };

    setState((prev) => ({ ...prev, tasks: prev.tasks.map((task) => (task.id === id ? { ...task, text: clean } : task)) }));
    return { ok: true };
  }, []);

  const removeTask = useCallback((id) => {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((task) => task.id !== id) }));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((task) => !task.done) }));
  }, []);

  const addNote = useCallback(
    (text) => {
      const clean = String(text ?? '').replace(/\r\n/g, '\n').trim().slice(0, LIMITS.note);
      if (!clean) return { ok: false, error: 'A note needs some text.' };
      if (state.notes.length >= LIMITS.notes) return { ok: false, error: `You can keep up to ${LIMITS.notes} notes.` };

      setState((prev) => ({ ...prev, notes: [{ id: createId('nt'), text: clean, updatedAt: Date.now() }, ...prev.notes] }));
      return { ok: true };
    },
    [state?.notes.length],
  );

  const updateNote = useCallback((id, text) => {
    const clean = String(text ?? '').replace(/\r\n/g, '\n').trim().slice(0, LIMITS.note);
    if (!clean) return { ok: false, error: 'A note needs some text.' };

    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((note) => (note.id === id ? { ...note, text: clean, updatedAt: Date.now() } : note)),
    }));
    return { ok: true };
  }, []);

  const removeNote = useCallback((id) => {
    setState((prev) => ({ ...prev, notes: prev.notes.filter((note) => note.id !== id) }));
  }, []);

  const resetAll = useCallback(async () => {
    try {
      await clearDashboard();
    } catch (error) {
      setStorageError(describeStorageError(error));
    }
    const defaults = createDefaultState();
    lastSaved.current = JSON.stringify(defaults);
    setState(defaults);
    setPanel((prev) => ({ ...prev, open: false }));
  }, []);

  const actions = useMemo(
    () => ({
      updateSettings,
      setTheme,
      openSettings,
      closeSettings,
      setSettingsSection,
      dismissStorageError,
      addShortcut,
      updateShortcut,
      removeShortcut,
      moveShortcut,
      setWidgetVisible,
      hideWidget,
      moveWidget,
      addTask,
      toggleTask,
      updateTask,
      removeTask,
      clearCompletedTasks,
      addNote,
      updateNote,
      removeNote,
      resetAll,
    }),
    [
      updateSettings,
      setTheme,
      openSettings,
      closeSettings,
      setSettingsSection,
      dismissStorageError,
      addShortcut,
      updateShortcut,
      removeShortcut,
      moveShortcut,
      setWidgetVisible,
      hideWidget,
      moveWidget,
      addTask,
      toggleTask,
      updateTask,
      removeTask,
      clearCompletedTasks,
      addNote,
      updateNote,
      removeNote,
      resetAll,
    ],
  );

  const value = useMemo(() => ({ state, storageError, panel, actions }), [state, storageError, panel, actions]);

  if (!state) {
    return (
      <div className="boot" role="status" aria-live="polite">
        <span className="boot__mark" aria-hidden="true" />
        <p>Waking up Luma…</p>
      </div>
    );
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error('useDashboard must be used inside <DashboardProvider>.');
  return value;
}
