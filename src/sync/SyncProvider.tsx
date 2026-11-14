import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useAccount } from '../account/AccountProvider';
import { useDashboard } from '../state/DashboardProvider';
import { createStore, type KeyValueStore } from '../storage/browserStorage';
import { friendlyMessage, isOfflineError } from '../services/apiClient';
import { syncService, SyncConflictError, type SyncSettings } from '../services/syncService';
import {
  SYNC_CATEGORIES,
  applyCategory,
  defaultEnabledCategories,
  fingerprint,
  hasLocalContent,
  sliceCategory,
  SYNC_CATEGORY_IDS,
  type SyncCategoryId,
} from './categories';

export type SyncStatus = 'signed-out' | 'idle' | 'syncing' | 'pending' | 'offline' | 'error';

export interface SyncConflict {
  id: SyncCategoryId;
  label: string;
  local: unknown;
  remote: unknown;
  remoteVersion: number;
  remoteUpdatedAt: number;
}

interface SyncMeta {
  ownerId: string | null;
  autoSync: boolean;
  categories: Record<SyncCategoryId, boolean>;
  versions: Partial<Record<SyncCategoryId, number>>;
  fingerprints: Partial<Record<SyncCategoryId, string>>;
  lastSyncedAt: number | null;
  /** Whether this account's sync preferences have been read from the server. */
  serverSynced: boolean;
}

interface SyncContextValue {
  status: SyncStatus;
  autoSync: boolean;
  categories: Record<SyncCategoryId, boolean>;
  enabledCount: number;
  lastSyncedAt: number | null;
  pendingCount: number;
  error: string | null;
  conflicts: SyncConflict[];
  syncNow: () => Promise<void>;
  setAutoSync: (value: boolean) => Promise<void>;
  setCategoryEnabled: (id: SyncCategoryId, value: boolean) => Promise<void>;
  resolveConflict: (id: SyncCategoryId, choice: 'local' | 'remote') => Promise<void>;
  dismissConflicts: () => void;
  clearError: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);
const SYNC_META_KEY = 'luma.sync.v1';
const AUTO_SYNC_DEBOUNCE_MS = 1100;

function defaultMeta(): SyncMeta {
  return {
    ownerId: null,
    autoSync: true,
    categories: defaultEnabledCategories(),
    versions: {},
    fingerprints: {},
    lastSyncedAt: null,
    serverSynced: false,
  };
}

function normalizeMeta(value: unknown): SyncMeta {
  const base = defaultMeta();
  if (!value || typeof value !== 'object') return base;
  const source = value as Partial<SyncMeta>;

  const categories = defaultEnabledCategories();
  if (source.categories && typeof source.categories === 'object') {
    for (const id of SYNC_CATEGORY_IDS) {
      if (typeof source.categories[id] === 'boolean') categories[id] = source.categories[id] === true;
    }
  }

  return {
    ownerId: typeof source.ownerId === 'string' ? source.ownerId : null,
    autoSync: typeof source.autoSync === 'boolean' ? source.autoSync : true,
    categories,
    versions: source.versions ?? {},
    fingerprints: source.fingerprints ?? {},
    lastSyncedAt: typeof source.lastSyncedAt === 'number' ? source.lastSyncedAt : null,
    serverSynced: source.serverSynced === true,
  };
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { data, dispatch } = useDashboard();
  const { status: accountStatus, user } = useAccount();

  const storeRef = useRef<KeyValueStore | null>(null);
  if (storeRef.current === null) storeRef.current = createStore();
  const store = storeRef.current;

  const [meta, setMeta] = useState<SyncMeta>(defaultMeta);
  const [metaReady, setMetaReady] = useState(false);
  const [status, setStatus] = useState<SyncStatus>('signed-out');
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  const runningRef = useRef(false);
  const dataRef = useRef(data);
  dataRef.current = data;
  const metaRef = useRef(meta);
  metaRef.current = meta;
  const signedIn = accountStatus === 'signed-in';
  const signedInRef = useRef(signedIn);
  signedInRef.current = signedIn;

  // Load saved sync bookkeeping once.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await store.get(SYNC_META_KEY);
        if (!cancelled && stored) setMeta(normalizeMeta(stored));
      } catch {
        // Keep defaults; sync still works, it just starts from scratch.
      } finally {
        if (!cancelled) setMetaReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  useEffect(() => {
    if (!metaReady) return;
    void store.set(SYNC_META_KEY, meta).catch(() => undefined);
  }, [meta, metaReady, store]);

  const applyMeta = useCallback((next: SyncMeta) => {
    metaRef.current = next;
    setMeta(next);
  }, []);

  const runSync = useCallback(async () => {
    if (!signedInRef.current || runningRef.current) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus('offline');
      return;
    }

    runningRef.current = true;
    setStatus('syncing');
    setError(null);

    try {
      const index = await syncService.index();
      let current = metaRef.current;

      if (!current.serverSynced) {
        if (index.lastSyncedAt > 0) {
          const categories = defaultEnabledCategories();
          for (const id of SYNC_CATEGORY_IDS) {
            if (typeof index.settings.categories[id] === 'boolean') {
              categories[id] = index.settings.categories[id] === true;
            }
          }
          current = {
            ...current,
            autoSync: index.settings.autoSync,
            categories,
            serverSynced: true,
          };
        } else {
          await syncService.saveSettings({
            autoSync: current.autoSync,
            categories: current.categories,
          });
          current = { ...current, serverSynced: true };
        }
        applyMeta(current);
      }

      let workingData = dataRef.current;
      const versions = { ...current.versions };
      const prints = { ...current.fingerprints };
      let lastSyncedAt = index.lastSyncedAt || current.lastSyncedAt;
      const found: SyncConflict[] = [];

      for (const category of SYNC_CATEGORIES) {
        const id = category.id;
        if (!current.categories[id]) continue;

        const local = sliceCategory(workingData, id);
        const localPrint = fingerprint(local);
        const knownVersion = versions[id] ?? 0;
        const serverVersion = index.categories[id]?.version ?? 0;
        const neverSynced = prints[id] === undefined;
        const localChanged = neverSynced ? hasLocalContent(workingData, id) : prints[id] !== localPrint;

        if (!localChanged && serverVersion === knownVersion) continue;

        if (localChanged && serverVersion === knownVersion) {
          const pushed = await syncService.push(id, local, knownVersion);
          versions[id] = pushed.version;
          prints[id] = localPrint;
          lastSyncedAt = pushed.updatedAt;
          continue;
        }

        if (!localChanged) {
          const remote = await syncService.pull(id);
          workingData = applyCategory(workingData, id, remote.data);
          versions[id] = remote.version;
          prints[id] = fingerprint(sliceCategory(workingData, id));
          lastSyncedAt = remote.updatedAt || lastSyncedAt;
          continue;
        }

        if (serverVersion === 0) {
          const pushed = await syncService.push(id, local, 0);
          versions[id] = pushed.version;
          prints[id] = localPrint;
          lastSyncedAt = pushed.updatedAt;
          continue;
        }

        // Both sides moved. An untouched local slice simply takes the cloud copy.
        if (neverSynced && !hasLocalContent(workingData, id)) {
          const remote = await syncService.pull(id);
          workingData = applyCategory(workingData, id, remote.data);
          versions[id] = remote.version;
          prints[id] = fingerprint(sliceCategory(workingData, id));
          lastSyncedAt = remote.updatedAt || lastSyncedAt;
          continue;
        }

        try {
          const pushed = await syncService.push(id, local, knownVersion);
          versions[id] = pushed.version;
          prints[id] = localPrint;
          lastSyncedAt = pushed.updatedAt;
        } catch (cause) {
          if (!(cause instanceof SyncConflictError)) throw cause;
          found.push({
            id,
            label: category.label,
            local,
            remote: cause.remote.data,
            remoteVersion: cause.remote.version,
            remoteUpdatedAt: cause.remote.updatedAt,
          });
        }
      }

      if (workingData !== dataRef.current) {
        dataRef.current = workingData;
        dispatch({ type: 'dashboard/hydrate', data: workingData });
      }

      applyMeta({ ...current, versions, fingerprints: prints, lastSyncedAt });

      if (found.length > 0) {
        setConflicts((existing) => {
          const byId = new Map(existing.map((entry) => [entry.id, entry]));
          for (const entry of found) byId.set(entry.id, entry);
          return Array.from(byId.values());
        });
        // The conflict banner carries the message; a duplicate error note would
        // only repeat it.
        setError(null);
        setStatus('error');
        return;
      }

      const pending = SYNC_CATEGORIES.filter((category) => {
        if (!current.categories[category.id]) return false;
        const print = prints[category.id];
        // A category that has never held local content is not "waiting" —
        // there is nothing to send until the person adds something.
        if (print === undefined) return false;
        return print !== fingerprint(sliceCategory(workingData, category.id));
      }).length;

      setStatus(pending > 0 ? 'pending' : 'idle');
    } catch (cause) {
      if (isOfflineError(cause)) {
        setStatus('offline');
        setError(null);
      } else {
        setStatus('error');
        setError(friendlyMessage(cause));
      }
    } finally {
      runningRef.current = false;
    }
  }, [applyMeta, dispatch]);

  // On sign-in: adopt the account's bookkeeping, then sync straight away.
  useEffect(() => {
    if (accountStatus !== 'signed-in' || !user || !metaReady) return;

    if (metaRef.current.ownerId !== user.id) {
      const next: SyncMeta = {
        ...defaultMeta(),
        autoSync: metaRef.current.autoSync,
        categories: metaRef.current.categories,
        ownerId: user.id,
      };
      applyMeta(next);
    }

    void runSync();
  }, [accountStatus, user, metaReady, applyMeta, runSync]);

  useEffect(() => {
    if (accountStatus === 'signed-out' || accountStatus === 'unavailable') {
      setStatus('signed-out');
    }
  }, [accountStatus]);

  // Auto-sync after edits settle.
  useEffect(() => {
    if (!signedIn || !metaReady || !meta.autoSync) return undefined;

    const timer = window.setTimeout(() => {
      void runSync();
    }, AUTO_SYNC_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [data, signedIn, metaReady, meta.autoSync, runSync]);

  // Coming back online retries whatever is still waiting.
  useEffect(() => {
    const handleOnline = () => {
      if (signedInRef.current) void runSync();
    };
    const handleOffline = () => {
      if (signedInRef.current) setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [runSync]);

  const persistSettings = useCallback(
    async (next: Pick<SyncMeta, 'autoSync' | 'categories'>) => {
      applyMeta({ ...metaRef.current, ...next });
      if (!signedInRef.current) return;

      try {
        const settings: SyncSettings = { autoSync: next.autoSync, categories: next.categories };
        await syncService.saveSettings(settings);
      } catch (cause) {
        setError(friendlyMessage(cause));
        setStatus(isOfflineError(cause) ? 'offline' : 'error');
      }
    },
    [applyMeta],
  );

  const setAutoSync = useCallback(
    (value: boolean) => persistSettings({ autoSync: value, categories: metaRef.current.categories }),
    [persistSettings],
  );

  const setCategoryEnabled = useCallback(
    (id: SyncCategoryId, value: boolean) =>
      persistSettings({
        autoSync: metaRef.current.autoSync,
        categories: { ...metaRef.current.categories, [id]: value },
      }),
    [persistSettings],
  );

  const resolveConflict = useCallback(
    async (id: SyncCategoryId, choice: 'local' | 'remote') => {
      const conflict = conflicts.find((entry) => entry.id === id);
      if (!conflict) return;

      setError(null);
      try {
        if (choice === 'local') {
          const pushed = await syncService.push(id, conflict.local, conflict.remoteVersion);
          applyMeta({
            ...metaRef.current,
            versions: { ...metaRef.current.versions, [id]: pushed.version },
            fingerprints: {
              ...metaRef.current.fingerprints,
              [id]: fingerprint(conflict.local),
            },
            lastSyncedAt: pushed.updatedAt,
          });
        } else {
          const nextData = applyCategory(dataRef.current, id, conflict.remote);
          dataRef.current = nextData;
          dispatch({ type: 'dashboard/hydrate', data: nextData });
          applyMeta({
            ...metaRef.current,
            versions: { ...metaRef.current.versions, [id]: conflict.remoteVersion },
            fingerprints: {
              ...metaRef.current.fingerprints,
              [id]: fingerprint(sliceCategory(nextData, id)),
            },
          });
        }

        setConflicts((existing) => {
          const remaining = existing.filter((entry) => entry.id !== id);
          if (remaining.length === 0) setStatus('idle');
          return remaining;
        });
      } catch (cause) {
        setStatus(isOfflineError(cause) ? 'offline' : 'error');
        setError(friendlyMessage(cause));
      }
    },
    [applyMeta, conflicts, dispatch],
  );

  const pendingCount = useMemo(() => {
    if (!signedIn) return 0;
    return SYNC_CATEGORIES.filter((category) => {
      if (!meta.categories[category.id]) return false;
      const print = meta.fingerprints[category.id];
      return print !== undefined && print !== fingerprint(sliceCategory(data, category.id));
    }).length;
  }, [data, meta.categories, meta.fingerprints, signedIn]);

  const enabledCount = useMemo(
    () => SYNC_CATEGORIES.filter((category) => meta.categories[category.id]).length,
    [meta.categories],
  );

  const value = useMemo<SyncContextValue>(
    () => ({
      status,
      autoSync: meta.autoSync,
      categories: meta.categories,
      enabledCount,
      lastSyncedAt: meta.lastSyncedAt,
      pendingCount,
      error,
      conflicts,
      syncNow: async () => {
        setConflicts([]);
        await runSync();
      },
      setAutoSync,
      setCategoryEnabled,
      resolveConflict,
      dismissConflicts: () => {
        setConflicts([]);
        setStatus(pendingCount > 0 ? 'pending' : 'idle');
      },
      clearError: () => setError(null),
    }),
    [
      status,
      meta.autoSync,
      meta.categories,
      meta.lastSyncedAt,
      enabledCount,
      pendingCount,
      error,
      conflicts,
      runSync,
      setAutoSync,
      setCategoryEnabled,
      resolveConflict,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync() must be used inside <SyncProvider>.');
  return context;
}
