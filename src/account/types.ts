export interface AccountUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: number;
  hasPassword: boolean;
}

export interface DeviceSummary {
  id: string;
  label: string;
  createdAt: number;
  lastSeenAt: number;
  current: boolean;
}

export interface VerificationState {
  required: boolean;
  devCode?: string;
  devNotice?: string;
}

export interface SocialProviderInfo {
  id: string;
  label: string;
  configured: boolean;
  note?: string;
  env: string[];
}

export interface SessionPayload {
  user: AccountUser;
  verification: VerificationState;
  device: DeviceSummary;
}

export type ActionResult = { ok: true; message?: string } | { ok: false; message: string };

export const ok = (message?: string): ActionResult => ({ ok: true, message });
export const failed = (message: string): ActionResult => ({ ok: false, message });
