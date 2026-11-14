import { useState, type FormEvent } from 'react';
import { useAccount } from '../../account/AccountProvider';
import type { AccountView } from '../../account/views';
import { formatRelativeTime } from '../../lib/format';
import { useSync } from '../../sync/SyncProvider';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Field, Input } from '../ui/Field';
import { Badge } from '../ui/Badge';
import { CheckIcon, TrashIcon, UserIcon } from '../icons';
import { StatusNote, Spinner } from './StatusNote';

const SYNC_LABELS: Record<string, string> = {
  idle: 'All changes synced',
  syncing: 'Syncing now…',
  pending: 'Changes waiting to sync',
  offline: 'Offline — saving on this device',
  error: 'Sync needs attention',
  'signed-out': 'Not syncing',
};

export function AccountOverview({ onNavigate }: { onNavigate: (view: AccountView) => void }) {
  const { user, verification, signOut, signOutEverywhere, verifyEmail, resendVerification } =
    useAccount();
  const { status: syncStatus, lastSyncedAt, pendingCount } = useSync();

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'verify' | 'resend' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'sign-out' | 'all' | null>(null);

  if (!user) return null;

  const initial = (user.name || user.email).slice(0, 1).toUpperCase();

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setBusy('verify');
    setError(null);
    const result = await verifyEmail(code.trim());
    if (!result.ok) setError(result.message);
    else setNotice(result.message ?? 'Email confirmed.');
    setBusy(null);
  };

  const handleResend = async () => {
    setBusy('resend');
    setError(null);
    const result = await resendVerification();
    if (!result.ok) setError(result.message);
    setBusy(null);
  };

  return (
    <section className="account-section" aria-labelledby="account-overview">
      <div>
        <h3 className="settings__section-title" id="account-overview">
          Your account
        </h3>
        <p className="settings__section-intro">
          Signed in as {user.email}. Your local dashboard is untouched when you sign out.
        </p>
      </div>

      <div className="account-card">
        <div className="account-card__head">
          <span className="account-avatar">{initial || <UserIcon size={18} />}</span>
          <div className="account-card__identity">
            <span className="account-card__name">{user.name || 'No name yet'}</span>
            <span className="account-card__email">{user.email}</span>
          </div>
          {user.emailVerified ? (
            <Badge>
              <CheckIcon size={12} /> Verified
            </Badge>
          ) : (
            <Badge muted>Email not confirmed</Badge>
          )}
        </div>

        <dl className="account-facts">
          <div>
            <dt>Member since</dt>
            <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt>Sign-in method</dt>
            <dd>{user.hasPassword ? 'Email and password' : 'Connected provider'}</dd>
          </div>
          <div>
            <dt>Sync</dt>
            <dd>
              {SYNC_LABELS[syncStatus] ?? syncStatus}
              {lastSyncedAt ? ` · ${formatRelativeTime(lastSyncedAt)}` : ''}
              {pendingCount > 0 ? ` · ${pendingCount} waiting` : ''}
            </dd>
          </div>
        </dl>
      </div>

      {verification?.required ? (
        <div className="settings__group">
          <p className="settings__group-title">Confirm your email</p>
          <p className="account-hint">
            Enter the six-digit code from your email. Confirming protects account recovery.
          </p>
          {verification.devCode ? (
            <StatusNote tone="info" title="Preview code">
              <span className="auth__code">{verification.devCode}</span>
              <span className="auth__hint">{verification.devNotice}</span>
            </StatusNote>
          ) : null}
          {error ? <StatusNote tone="error">{error}</StatusNote> : null}
          {!error && notice ? <StatusNote tone="success">{notice}</StatusNote> : null}
          <form className="account-inline-form" onSubmit={handleVerify}>
            <Field label="Verification code" htmlFor="verify-code">
              <Input
                id="verify-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              />
            </Field>
            <Button type="submit" variant="primary" disabled={busy !== null || code.length !== 6}>
              {busy === 'verify' ? <Spinner label="Checking…" /> : 'Confirm email'}
            </Button>
            <Button variant="ghost" onClick={handleResend} disabled={busy !== null}>
              {busy === 'resend' ? 'Sending…' : 'Resend code'}
            </Button>
          </form>
        </div>
      ) : null}

      <div className="account-actions">
        <Button onClick={() => onNavigate('devices')}>Connected devices</Button>
        <Button onClick={() => onNavigate('sync')}>Sync settings</Button>
        <Button onClick={() => onNavigate('privacy')}>Privacy &amp; data</Button>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Session</p>
        <div className="account-actions">
          <Button onClick={() => setConfirm('sign-out')}>Sign out</Button>
          <Button variant="danger" icon={<TrashIcon size={15} />} onClick={() => setConfirm('all')}>
            Sign out everywhere
          </Button>
        </div>
        <p className="account-hint">
          Signing out never deletes your dashboard: shortcuts, notes, tasks and settings stay on
          this device.
        </p>
      </div>

      <ConfirmDialog
        open={confirm === 'sign-out'}
        title="Sign out?"
        description="Your dashboard stays on this device and keeps working offline."
        confirmLabel="Sign out"
        note="You can sign back in at any time."
        onConfirm={() => void signOut()}
        onClose={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === 'all'}
        title="Sign out on every device?"
        description="Every browser signed in to this account will be signed out. Local dashboards are not deleted."
        confirmLabel="Sign out everywhere"
        note="You can sign back in at any time."
        onConfirm={() => void signOutEverywhere()}
        onClose={() => setConfirm(null)}
      />
    </section>
  );
}
