import { apiRequest } from './apiClient';

export type IntegrationStatus =
  | 'connected'
  | 'disconnected'
  | 'needs_credentials'
  | 'expired'
  | 'error'
  | 'unavailable'
  | 'not_required';

export interface IntegrationInfo {
  id: string;
  name: string;
  category: string;
  kind: 'oauth' | 'api-key' | 'browser' | 'links';
  scopes: string[];
  permissions: string;
  summary: string;
  status: IntegrationStatus;
  env?: string[];
  reason?: string;
  message?: string;
  accountLabel?: string | null;
  connectedAt?: number | null;
}

export const integrationService = {
  list() {
    return apiRequest<{ integrations: IntegrationInfo[] }>('/integrations');
  },

  connect(id: string) {
    return apiRequest<{ authorizeUrl?: string; status?: string }>(`/integrations/${id}/connect`, {
      method: 'POST',
    });
  },

  disconnect(id: string) {
    return apiRequest<{ ok: boolean }>(`/integrations/${id}`, { method: 'DELETE' });
  },
};
