import { apiRequest } from './apiClient';
import type {
  AccountUser,
  DeviceSummary,
  SessionPayload,
  SocialProviderInfo,
  VerificationState,
} from '../account/types';

export interface AuthResponse {
  user: AccountUser;
  verification: VerificationState;
}

export interface ResetRequestResponse {
  ok: boolean;
  message: string;
  devCode?: string;
  devNotice?: string;
}

export const authService = {
  session(signal?: AbortSignal) {
    return apiRequest<SessionPayload>('/auth/session', { signal });
  },

  signUp(input: { email: string; password: string; name: string }) {
    return apiRequest<AuthResponse>('/auth/signup', { method: 'POST', body: input });
  },

  signIn(input: { email: string; password: string }) {
    return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input });
  },

  signOut() {
    return apiRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' });
  },

  signOutEverywhere() {
    return apiRequest<{ ok: boolean }>('/auth/logout-all', { method: 'POST' });
  },

  verifyEmail(code: string) {
    return apiRequest<{ ok: boolean; emailVerified: boolean }>('/auth/verify-email', {
      method: 'POST',
      body: { code },
    });
  },

  resendVerification() {
    return apiRequest<{ ok: boolean; verification: VerificationState }>(
      '/auth/verify-email/resend',
      { method: 'POST' },
    );
  },

  requestReset(email: string) {
    return apiRequest<ResetRequestResponse>('/auth/password/forgot', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword(input: { email: string; code: string; password: string }) {
    return apiRequest<{ ok: boolean; user: AccountUser }>('/auth/password/reset', {
      method: 'POST',
      body: input,
    });
  },

  devices() {
    return apiRequest<{ devices: DeviceSummary[] }>('/auth/devices');
  },

  revokeDevice(id: string) {
    return apiRequest<{ ok: boolean; signedOutHere: boolean }>(`/auth/devices/${id}`, {
      method: 'DELETE',
    });
  },

  providers() {
    return apiRequest<{ providers: SocialProviderInfo[] }>('/auth/providers');
  },

  startSocial(providerId: string) {
    return apiRequest<{ authorizeUrl: string }>(`/oauth/${providerId}/start`, { method: 'POST' });
  },
};
