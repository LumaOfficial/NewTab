import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, friendlyMessage } from '../services/apiClient';
import { authService, type ResetRequestResponse } from '../services/authService';
import {
  failed,
  ok,
  type AccountUser,
  type ActionResult,
  type SocialProviderInfo,
  type VerificationState,
} from './types';

export type AccountStatus = 'checking' | 'signed-out' | 'signed-in' | 'unavailable';

interface AccountContextValue {
  status: AccountStatus;
  user: AccountUser | null;
  verification: VerificationState | null;
  providers: SocialProviderInfo[];
  notice: string | null;
  error: string | null;
  clearNotice: () => void;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<ActionResult>;
  signUp: (input: { email: string; password: string; name: string }) => Promise<ActionResult>;
  signOut: () => Promise<ActionResult>;
  signOutEverywhere: () => Promise<ActionResult>;
  verifyEmail: (code: string) => Promise<ActionResult>;
  resendVerification: () => Promise<ActionResult>;
  requestReset: (email: string) => Promise<ResetRequestResponse | { ok: false; message: string }>;
  resetPassword: (input: {
    email: string;
    code: string;
    password: string;
  }) => Promise<ActionResult>;
  startSocial: (providerId: string) => Promise<ActionResult>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

const OAUTH_NOTICES: Record<string, string> = {
  signed_in: 'Signed in.',
  connected: 'Connection added.',
  denied: 'The service did not grant access, so nothing was connected.',
  error: 'That sign-in could not be completed. Try again.',
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccountStatus>('checking');
  const [user, setUser] = useState<AccountUser | null>(null);
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [providers, setProviders] = useState<SocialProviderInfo[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const payload = await authService.session();
      setUser(payload.user);
      setVerification(payload.verification);
      setStatus('signed-in');
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setUser(null);
        setVerification(null);
        setStatus('signed-out');
        return;
      }
      setStatus('unavailable');
    }
  }, []);

  // Session bootstrap + the result of an OAuth redirect back into the tab.
  useEffect(() => {
    void refreshSession();

    void (async () => {
      try {
        const payload = await authService.providers();
        setProviders(payload.providers);
      } catch {
        setProviders([]);
      }
    })();

    const params = new URLSearchParams(window.location.search);
    const oauth = params.get('oauth');
    if (oauth) {
      if (oauth === 'signed_in' || oauth === 'connected') {
        setNotice(OAUTH_NOTICES[oauth] ?? null);
        void refreshSession();
      } else {
        setError(OAUTH_NOTICES[oauth] ?? OAUTH_NOTICES.error);
      }

      params.delete('oauth');
      params.delete('integration');
      params.delete('reason');
      const query = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    }
  }, [refreshSession]);

  const handle = useCallback(async (run: () => Promise<void>): Promise<ActionResult> => {
    setError(null);
    try {
      await run();
      return ok();
    } catch (cause) {
      const message = friendlyMessage(cause);
      if (cause instanceof ApiError && cause.code === 'unauthorized') {
        setStatus('signed-out');
        setUser(null);
      }
      setError(message);
      return failed(message);
    }
  }, []);

  const signIn = useCallback(
    (input: { email: string; password: string }) =>
      handle(async () => {
        const payload = await authService.signIn(input);
        setUser(payload.user);
        setVerification(payload.verification);
        setStatus('signed-in');
        setNotice('Welcome back.');
      }),
    [handle],
  );

  const signUp = useCallback(
    (input: { email: string; password: string; name: string }) =>
      handle(async () => {
        const payload = await authService.signUp(input);
        setUser(payload.user);
        setVerification(payload.verification);
        setStatus('signed-in');
        setNotice('Account created. Your dashboard is now yours on every device.');
      }),
    [handle],
  );

  const signOut = useCallback(
    () =>
      handle(async () => {
        await authService.signOut().catch((cause) => {
          // A failed call on a dead connection still clears the local session.
          if (!(cause instanceof ApiError) || cause.code !== 'offline') throw cause;
        });
        setUser(null);
        setVerification(null);
        setStatus(navigator.onLine === false ? 'unavailable' : 'signed-out');
        setNotice('Signed out. Your dashboard stays on this device.');
      }),
    [handle],
  );

  const signOutEverywhere = useCallback(
    () =>
      handle(async () => {
        await authService.signOutEverywhere();
        setUser(null);
        setVerification(null);
        setStatus('signed-out');
        setNotice('Signed out on every device.');
      }),
    [handle],
  );

  const verifyEmail = useCallback(
    (code: string) =>
      handle(async () => {
        await authService.verifyEmail(code);
        setUser((current) => (current ? { ...current, emailVerified: true } : current));
        setVerification({ required: false });
        setNotice('Email confirmed.');
      }),
    [handle],
  );

  const resendVerification = useCallback(
    () =>
      handle(async () => {
        const payload = await authService.resendVerification();
        setVerification(payload.verification);
        setNotice('A new code is ready.');
      }),
    [handle],
  );

  const requestReset = useCallback(
    async (email: string) => {
      setError(null);
      try {
        return await authService.requestReset(email);
      } catch (cause) {
        const message = friendlyMessage(cause);
        setError(message);
        return { ok: false as const, message };
      }
    },
    [],
  );

  const resetPassword = useCallback(
    (input: { email: string; code: string; password: string }) =>
      handle(async () => {
        const payload = await authService.resetPassword(input);
        setUser(payload.user);
        setStatus('signed-in');
        setVerification({ required: false });
        setNotice('Password updated. You are signed in.');
      }),
    [handle],
  );

  const startSocial = useCallback(
    (providerId: string) =>
      handle(async () => {
        const payload = await authService.startSocial(providerId);
        window.location.assign(payload.authorizeUrl);
      }),
    [handle],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      status,
      user,
      verification,
      providers,
      notice,
      error,
      clearNotice: () => setNotice(null),
      clearError: () => setError(null),
      refreshSession,
      signIn,
      signUp,
      signOut,
      signOutEverywhere,
      verifyEmail,
      resendVerification,
      requestReset,
      resetPassword,
      startSocial,
    }),
    [
      status,
      user,
      verification,
      providers,
      notice,
      error,
      refreshSession,
      signIn,
      signUp,
      signOut,
      signOutEverywhere,
      verifyEmail,
      resendVerification,
      requestReset,
      resetPassword,
      startSocial,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount() must be used inside <AccountProvider>.');
  return context;
}
