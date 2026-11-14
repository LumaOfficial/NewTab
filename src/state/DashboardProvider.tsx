import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import { createStore, describeStorageError, type KeyValueStore, type StorageKind } from '../storage/browserStorage';
import {
  createDefaultRoot,
  sanitizeRoot,
  STORAGE_KEY,
  type CustomTheme,
  type DashboardData,
  type DashboardRoot,
  type OnboardingState,
  type SavedLayout,
  type Workspace,
} from '../storage/schema';
import { activeDataOf, activeWorkspaceOf, dashboardReducer, type DashboardAction } from './dashboardReducer';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface DashboardContextValue {
  /** The active workspace's dashboard data (settings, notes, tasks…). */
  data: DashboardData;
  root: DashboardRoot;
  dispatch: Dispatch<DashboardAction>;
  /** `loading` until the first read from storage settles. */
  status: 'loading' | 'ready';
  saveState: SaveState;
  storageKind: StorageKind;
  /** Human-readable reason the last read/write failed, if any. */
  storageError: string | null;
  resetDashboard: () => void;
  workspace: Workspace;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  customThemes: CustomTheme[];
  savedLayouts: SavedLayout[];
  onboarding: OnboardingState;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 250;

export function DashboardProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<KeyValueStore | null>(null);
  if (storeRef.current === null) storeRef.current = createStore();
  const store = storeRef.current;

  const [root, dispatch] = useReducer(dashboardReducer, undefined, createDefaultRoot);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [storageError, setStorageError] = useState<string | null>(null);

  // Load once on mount. Older single-dashboard records are wrapped into a
  // workspace by sanitizeRoot, so an existing install never loses data.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await store.get(STORAGE_KEY);
        if (!cancelled && stored != null) {
          dispatch({ type: 'dashboard/hydrate-root', root: sanitizeRoot(stored) });
        }
        if (!cancelled && store.kind === 'unavailable') {
          setStorageError(
            'Browser storage is unavailable, so changes will only last for this session.',
          );
        }
      } catch (error) {
        if (!cancelled) setStorageError(describeStorageError(error));
      } finally {
        if (!cancelled) setStatus('ready');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [store]);

  // Persist after edits, debounced so typing in a note or task does not write
  // on every keystroke.
  useEffect(() => {
    if (status !== 'ready') return;

    setSaveState('saving');
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          await store.set(STORAGE_KEY, root);
          setSaveState('saved');
          setStorageError(null);
        } catch (error) {
          setSaveState('error');
          setStorageError(describeStorageError(error));
        }
      })();
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [root, status, store]);

  const data = activeDataOf(root);
  const workspace = activeWorkspaceOf(root);

  const value = useMemo<DashboardContextValue>(
    () => ({
      data,
      root,
      dispatch,
      status,
      saveState,
      storageKind: store.kind,
      storageError,
      resetDashboard: () => dispatch({ type: 'dashboard/reset' }),
      workspace,
      workspaces: root.workspaces,
      activeWorkspaceId: root.activeWorkspaceId,
      customThemes: root.customThemes,
      savedLayouts: root.savedLayouts,
      onboarding: root.onboarding,
    }),
    [data, root, status, saveState, store.kind, storageError, workspace],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard() must be used inside <DashboardProvider>.');
  }
  return context;
}
