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
  createDefaultDashboard,
  sanitizeDashboard,
  STORAGE_KEY,
  type DashboardData,
} from '../storage/schema';
import { dashboardReducer, type DashboardAction } from './dashboardReducer';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface DashboardContextValue {
  data: DashboardData;
  dispatch: Dispatch<DashboardAction>;
  /** `loading` until the first read from storage settles. */
  status: 'loading' | 'ready';
  saveState: SaveState;
  storageKind: StorageKind;
  /** Human-readable reason the last read/write failed, if any. */
  storageError: string | null;
  resetDashboard: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 250;

export function DashboardProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<KeyValueStore | null>(null);
  if (storeRef.current === null) storeRef.current = createStore();
  const store = storeRef.current;

  const [data, dispatch] = useReducer(dashboardReducer, undefined, createDefaultDashboard);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [storageError, setStorageError] = useState<string | null>(null);

  // Load once on mount.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await store.get(STORAGE_KEY);
        if (!cancelled && stored != null) {
          dispatch({ type: 'dashboard/hydrate', data: sanitizeDashboard(stored) });
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
          await store.set(STORAGE_KEY, data);
          setSaveState('saved');
          setStorageError(null);
        } catch (error) {
          setSaveState('error');
          setStorageError(describeStorageError(error));
        }
      })();
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [data, status, store]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      data,
      dispatch,
      status,
      saveState,
      storageKind: store.kind,
      storageError,
      resetDashboard: () => dispatch({ type: 'dashboard/reset' }),
    }),
    [data, status, saveState, store.kind, storageError],
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
