import { deviceHeaders } from '../account/device';

/**
 * One place that talks HTTP to Luma's account service.
 *
 * The preview calls it through the dev server's proxy (`/api`); the extension
 * build points `VITE_LUMA_API_URL` at the deployed service. Requests always
 * carry the session cookie, and failures are turned into messages a person can
 * act on instead of raw status codes.
 */
const configured = (import.meta.env.VITE_LUMA_API_URL as string | undefined)?.trim();
export const API_BASE = configured ? configured.replace(/\/+$/, '') : '/api';

export const OFFLINE_MESSAGE =
  'Luma can’t reach the sync service right now. Your dashboard keeps saving on this device.';

const FRIENDLY: Record<string, string> = {
  invalid_credentials: 'Email or password is incorrect.',
  email_taken: 'An account with that email already exists. Try signing in.',
  weak_password: 'Use at least 8 characters for your password.',
  invalid_email: 'Enter a valid email address.',
  invalid_code: 'That code doesn’t match. Check it and try again.',
  code_expired: 'That code has expired. Request a new one.',
  too_many_attempts: 'Too many tries. Wait a moment and request a new code.',
  rate_limited: 'Too many attempts. Wait a few minutes and try again.',
  unauthorized: 'Sign in to continue.',
  needs_credentials: 'This connection is not configured yet.',
  not_configured: 'This connection is not configured yet.',
  not_connected: 'That service is not connected.',
  not_connectable: 'That service does not need a connection.',
  reauth_required: 'Reconnect this service to continue.',
  confirmation_required: 'Type the confirmation text to continue.',
  device_not_found: 'That device is no longer signed in.',
  sync_conflict: 'Something changed on another device. Review the difference.',
  server_error: 'Something went wrong on Luma’s side. Try again.',
  storage_unavailable: 'Secure storage for connections is not configured.',
  refresh_not_implemented: 'Reconnecting is required for this service.',
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(message: string, status: number, code: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function friendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'offline') return OFFLINE_MESSAGE;
    return FRIENDLY[error.code] ?? error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Try again.';
}

export function isOfflineError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'offline';
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      cache: 'no-store',
      signal,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...deviceHeaders(),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(OFFLINE_MESSAGE, 0, 'offline');
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string }; [key: string]: unknown }
    | null;

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      error?.message ?? 'The request failed.',
      response.status,
      error?.code ?? 'unknown',
      (payload as Record<string, unknown>) ?? {},
    );
  }

  return payload as T;
}
