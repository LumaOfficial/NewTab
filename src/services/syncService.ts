import { ApiError, apiRequest } from './apiClient';

export interface SyncSettings {
  autoSync: boolean;
  categories: Record<string, boolean>;
}

export interface SyncIndex {
  settings: SyncSettings;
  lastSyncedAt: number;
  categories: Record<string, { version: number; updatedAt: number }>;
}

export interface RemoteCategory {
  category: string;
  version: number;
  updatedAt: number;
  data: unknown;
}

export interface PushResult {
  category: string;
  version: number;
  updatedAt: number;
}

/** Raised when another device wrote a category since this one last synced. */
export class SyncConflictError extends Error {
  readonly remote: RemoteCategory;

  constructor(remote: RemoteCategory) {
    super('This category changed on another device.');
    this.name = 'SyncConflictError';
    this.remote = remote;
  }
}

export const syncService = {
  index() {
    return apiRequest<SyncIndex>('/sync');
  },

  pull(category: string) {
    return apiRequest<RemoteCategory>(`/sync/${category}`);
  },

  async push(category: string, data: unknown, baseVersion: number) {
    try {
      return await apiRequest<PushResult>(`/sync/${category}`, {
        method: 'PUT',
        body: { data, baseVersion },
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'sync_conflict') {
        const remote = (error.details as { remote?: RemoteCategory }).remote;
        if (remote) throw new SyncConflictError(remote);
      }
      throw error;
    }
  },

  saveSettings(settings: SyncSettings) {
    return apiRequest<{ settings: SyncSettings }>('/sync', { method: 'PUT', body: settings });
  },
};
