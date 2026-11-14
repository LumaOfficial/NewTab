import { apiRequest } from './apiClient';

export interface AccountExport {
  exportedAt: string;
  account: Record<string, unknown>;
  sync: unknown;
  integrations: Record<string, unknown>;
  devices: unknown[];
  note: string;
}

export const privacyService = {
  exportData() {
    return apiRequest<AccountExport>('/account/export');
  },

  deleteSynced() {
    return apiRequest<{ ok: boolean }>('/account/delete-synced', { method: 'POST' });
  },

  disconnectAll() {
    return apiRequest<{ ok: boolean }>('/account/disconnect-integrations', { method: 'POST' });
  },

  deleteAccount(input: { confirmation: string; password?: string }) {
    return apiRequest<{ ok: boolean }>('/account', { method: 'DELETE', body: input });
  },
};
