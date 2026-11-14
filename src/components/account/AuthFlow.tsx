import { useState, type FormEvent } from 'react';
import { useAccount } from '../../account/AccountProvider';
import { Button } from '../ui/Button';
import { Field, Input } from '../ui/Field';
import { StatusNote, Spinner } from './StatusNote';

type AuthView = 'welcome' | 'create' | 'forgot' | 'reset';

interface ResetInfo {
  message: string;
  devCode?: string;
  devNotice?: string;
}

export interface AuthFlowProps {
  initialView?: 'welcome' | 'create' | 'forgot';
}

/**
 * Sign-in, create account, recovery and reset in one place. Every submit has a
 * busy state and every outcome is announced — success, denied and offline.
 */
export function AuthFlow({ initialView = 'welcome' }: AuthFlowProps) {
  const { providers, status, signIn, signUp, requestReset, resetPassword, startSocial } = useAccount();

  const [view, setView] = useState<AuthView>(initialView);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [resetInfo, setResetInfo] = useState<ResetInfo | null>(null);

  const reset = (next: AuthView) => {
    setView(next);
    setError(null);
    setNotice(null);
    setPassword('');
    setCode('');
  };

  const run = async (task: () => Promise<{ ok: boolean; message?: string }>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await task();
    if (!result.ok) setError(result.message ?? 'That did not work. Try again.');
    setBusy(false);
    return result.ok;
  };

  const handleSignIn = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    void run(() => signIn({ email: email.trim(), password }));
  };

  const handleSignUp = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    void run(() => signUp({ email: email.trim(), password, name: name.trim() }));
  };

  const handleForgot = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await requestReset(email.trim());
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setResetInfo({
      message: result.message,
      devCode: 'devCode' in result ? result.devCode : undefined,
      devNotice: 'devNotice' in result ? result.devNotice : undefined,
    });
    setNotice(result.message);
  };

  const handleReset = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    void run(() => resetPassword({ email: email.trim(), code: code.trim(), password }));
  };

  const handleSocial = (providerId: string) => {
    if (busy) return;
    void (async () => {
      setBusy(true);
      setError(null);
      const result = await startSocial(providerId);
      if (!result.ok) setError(result.message);
      setBusy(false);
    })();
  };

  return (
    <div className="auth">
      {status === 'unavailable' ? (
        <StatusNote tone="warning" title="Account service unreachable">
          Signing in needs a connection. Your dashboard still works and keeps saving on this
          device.
        </StatusNote>
      ) : null}

      {view === 'welcome' ? (
        <div className="auth__intro">
          <h3 className="auth__title">Your dashboard, on every device.</h3>
          <p className="auth__lede">
            Sign in to sync shortcuts, notes, tasks and settings. The dashboard keeps working
            offline either way.
          </p>
        </div>
      ) : null}

      {view === 'create' ? (
        <div className="auth__intro">
          <h3 className="auth__title">Create your account</h3>
          <p className="auth__lede">One account keeps your dashboard together across devices.</p>
        </div>
      ) : null}

      {view === 'forgot' ? (
        <div className="auth__intro">
          <h3 className="auth__title">Account recovery</h3>
          <p className="auth__lede">
            Enter the email you signed up with and we’ll send a six-digit reset code.
          </p>
        </div>
      ) : null}

      {view === 'reset' ? (
        <div className="auth__intro">
          <h3 className="auth__title">Set a new password</h3>
          <p className="auth__lede">Use the code from your email, then pick a new password.</p>
        </div>
      ) : null}

      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      {!error && notice ? <StatusNote tone="success">{notice}</StatusNote> : null}

      {view === 'welcome' ? (
        <>
          <form className="form-stack" onSubmit={handleSignIn}>
            <Field label="Email" htmlFor="auth-email">
              <Input
                id="auth-email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="you@example.com"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Password" htmlFor="auth-password">
              <Input
                id="auth-password"
                type="password"
                value={password}
                autoComplete="current-password"
                placeholder="Your password"
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <Button type="submit" variant="primary" block disabled={busy}>
              {busy ? <Spinner label="Signing in…" /> : 'Sign in'}
            </Button>
          </form>

          <div className="auth__links">
            <button type="button" className="link-btn" onClick={() => reset('forgot')}>
              Forgot your password?
            </button>
            <button type="button" className="link-btn" onClick={() => reset('create')}>
              Create an account
            </button>
          </div>

          <div className="auth__social">
            <span className="auth__divider">or continue with</span>
            <div className="auth__providers">
              {providers.map((provider) => (
                <Button
                  key={provider.id}
                  variant="secondary"
                  disabled={busy || !provider.configured}
                  title={
                    provider.configured
                      ? `Continue with ${provider.label}`
                      : `${provider.label} sign-in needs Luma’s OAuth client (${provider.env.join(', ')}).`
                  }
                  onClick={() => handleSocial(provider.id)}
                >
                  <span className="auth__provider-name">{provider.label}</span>
                  {!provider.configured ? <span className="auth__provider-flag">Soon</span> : null}
                </Button>
              ))}
            </div>
            {providers.some((provider) => !provider.configured) ? (
              <p className="auth__hint">
                Google, Apple and Microsoft sign-in stay disabled until Luma’s OAuth apps are
                configured. Email and password work now.
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      {view === 'create' ? (
        <>
          <form className="form-stack" onSubmit={handleSignUp}>
            <Field label="Name" htmlFor="create-name" hint="Used for your greeting. Optional.">
              <Input
                id="create-name"
                value={name}
                autoComplete="given-name"
                maxLength={60}
                placeholder="Alex"
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field label="Email" htmlFor="create-email">
              <Input
                id="create-email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="you@example.com"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field
              label="Password"
              htmlFor="create-password"
              hint="At least 8 characters. Luma never sees your password after sign-up."
            >
              <Input
                id="create-password"
                type="password"
                value={password}
                autoComplete="new-password"
                minLength={8}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <Button type="submit" variant="primary" block disabled={busy}>
              {busy ? <Spinner label="Creating your account…" /> : 'Create account'}
            </Button>
          </form>

          <div className="auth__links">
            <button type="button" className="link-btn" onClick={() => reset('welcome')}>
              I already have an account
            </button>
          </div>
        </>
      ) : null}

      {view === 'forgot' ? (
        <>
          <form className="form-stack" onSubmit={handleForgot}>
            <Field label="Email" htmlFor="forgot-email">
              <Input
                id="forgot-email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="you@example.com"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Button type="submit" variant="primary" block disabled={busy}>
              {busy ? <Spinner label="Sending…" /> : 'Send reset code'}
            </Button>
          </form>

          {resetInfo?.devCode ? (
            <StatusNote tone="info" title="Reset code">
              <span className="auth__code">{resetInfo.devCode}</span>
              <span className="auth__hint">{resetInfo.devNotice}</span>
            </StatusNote>
          ) : null}

          <div className="auth__links">
            <button type="button" className="link-btn" onClick={() => reset('reset')}>
              I have a reset code
            </button>
            <button type="button" className="link-btn" onClick={() => reset('welcome')}>
              Back to sign in
            </button>
          </div>
        </>
      ) : null}

      {view === 'reset' ? (
        <>
          <form className="form-stack" onSubmit={handleReset}>
            <Field label="Email" htmlFor="reset-email">
              <Input
                id="reset-email"
                type="email"
                value={email}
                autoComplete="email"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Reset code" htmlFor="reset-code" hint="The six digits from your email.">
              <Input
                id="reset-code"
                inputMode="numeric"
                value={code}
                autoComplete="one-time-code"
                maxLength={6}
                required
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              />
            </Field>
            <Field label="New password" htmlFor="reset-password" hint="At least 8 characters.">
              <Input
                id="reset-password"
                type="password"
                value={password}
                autoComplete="new-password"
                minLength={8}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <Button type="submit" variant="primary" block disabled={busy}>
              {busy ? <Spinner label="Updating…" /> : 'Update password'}
            </Button>
          </form>

          <div className="auth__links">
            <button type="button" className="link-btn" onClick={() => reset('welcome')}>
              Back to sign in
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
