import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAccount } from '../../account/AccountProvider';
import { useDashboard } from '../../state/DashboardProvider';
import { friendlyMessage } from '../../services/apiClient';
import { integrationService, type IntegrationInfo } from '../../services/integrationService';
import { privacyService } from '../../services/privacyService';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Dialog } from '../ui/Dialog';
import { Field, Input } from '../ui/Field';
import { StatusNote } from './StatusNote';

export function PrivacySection() {
  const { data } = useDashboard();
  const { user, refreshSession, signOutEverywhere } = useAccount();

  const [integrations, setIntegrations] = useState<IntegrationInfo[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'synced' | 'integrations' | 'signout' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadIntegrations = useCallback(async () => {
    try {
      const payload = await integrationService.list();
      setIntegrations(payload.integrations);
    } catch {
      setIntegrations([]);
    }
  }, []);

  useEffect(() => {
    void loadIntegrations();
  }, [loadIntegrations]);

  const connected = (integrations ?? []).filter((item) => item.status === 'connected');

  const exportData = async () => {
    setBusy('export');
    setError(null);
    setMessage(null);

    let account: unknown = null;
    let accountError: string | null = null;

    try {
      account = await privacyService.exportData();
    } catch (cause) {
      accountError = friendlyMessage(cause);
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      from: 'Luma New Tab',
      localDashboard: data,
      account,
      accountError,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luma-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    setMessage(
      accountError
        ? 'Downloaded your local data. Cloud data could not be reached, so it is missing from the file.'
        : 'Downloaded everything Luma holds for this account.',
    );
    setBusy(null);
  };

  const deleteSynced = async () => {
    setConfirm(null);
    setBusy('synced');
    setError(null);
    setMessage(null);

    try {
      await privacyService.deleteSynced();
      setMessage('Synchronised data removed. This device keeps its dashboard.');
    } catch (cause) {
      setError(friendlyMessage(cause));
    } finally {
      setBusy(null);
    }
  };

  const disconnectAll = async () => {
    setConfirm(null);
    setBusy('integrations');
    setError(null);
    setMessage(null);

    try {
      await privacyService.disconnectAll();
      await loadIntegrations();
      setMessage('Every integration has been disconnected.');
    } catch (cause) {
      setError(friendlyMessage(cause));
    } finally {
      setBusy(null);
    }
  };

  const signOutAll = async () => {
    setConfirm(null);
    setBusy('signout');
    await signOutEverywhere();
    setBusy(null);
  };

  return (
    <section className="account-section" aria-labelledby="account-privacy">
      <div>
        <h3 className="settings__section-title" id="account-privacy">
          Privacy &amp; data
        </h3>
        <p className="settings__section-intro">
          What Luma keeps, where it goes, and the controls to remove it.
        </p>
      </div>

      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      {message ? <StatusNote tone="success">{message}</StatusNote> : null}

      <div className="settings__group">
        <p className="settings__group-title">Stored on this device</p>
        <ul className="privacy-list">
          <li>Your theme, widget layout and dashboard settings.</li>
          <li>Shortcuts, notes, tasks and the recently deleted list.</li>
          <li>Sync preferences and which categories are enabled.</li>
        </ul>
        <p className="account-hint">
          This stays in browser storage. It is available offline and is not deleted when you
          sign out.
        </p>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Sent to your account</p>
        <ul className="privacy-list">
          <li>Only the categories you keep switched on in Sync.</li>
          <li>Each category carries a version number so older edits never overwrite newer ones.</li>
          <li>Your email address and sign-in method for the account itself.</li>
        </ul>
        <p className="account-hint">
          Passwords are stored only as a salted scrypt hash — Luma never keeps the password
          itself, and integration tokens are encrypted at rest.
        </p>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Connected integrations</p>
        {connected.length === 0 ? (
          <p className="account-hint">No services are connected right now.</p>
        ) : (
          <ul className="privacy-list">
            {connected.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong> — {item.permissions}
              </li>
            ))}
          </ul>
        )}
        <p className="account-hint">
          Disconnect any service from the Integrations panel. Luma only asks for the permissions
          listed there and never shares one service’s data with another.
        </p>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Your controls</p>
        <div className="privacy-actions">
          <Button
            variant="secondary"
            disabled={busy !== null}
            onClick={() => void exportData()}
          >
            {busy === 'export' ? 'Preparing…' : 'Export my data'}
          </Button>
          <Button
            variant="secondary"
            disabled={busy !== null}
            onClick={() => setConfirm('synced')}
          >
            Delete synchronized data
          </Button>
          <Button
            variant="secondary"
            disabled={busy !== null || connected.length === 0}
            onClick={() => setConfirm('integrations')}
          >
            Disconnect all integrations
          </Button>
          <Button variant="secondary" disabled={busy !== null} onClick={() => setConfirm('signout')}>
            Sign out everywhere
          </Button>
          <Button variant="danger" disabled={busy !== null} onClick={() => setDeleteOpen(true)}>
            Delete account…
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === 'synced'}
        title="Delete synchronized data?"
        description="Cloud copies of your categories are removed. The dashboard on this device is kept and will sync again when you make a change."
        confirmLabel="Delete cloud data"
        onConfirm={() => void deleteSynced()}
        onClose={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === 'integrations'}
        title="Disconnect every integration?"
        description="All services lose access at once. You can reconnect any of them later."
        confirmLabel="Disconnect all"
        onConfirm={() => void disconnectAll()}
        onClose={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === 'signout'}
        title="Sign out everywhere?"
        description="Every browser signed in to this account is signed out. Local dashboards stay."
        confirmLabel="Sign out everywhere"
        onConfirm={() => void signOutAll()}
        onClose={() => setConfirm(null)}
      />

      <DeleteAccountDialog
        open={deleteOpen}
        email={user?.email ?? ''}
        requiresPassword={Boolean(user?.hasPassword)}
        onClose={() => setDeleteOpen(false)}
        onDeleted={async () => {
          setDeleteOpen(false);
          await refreshSession();
        }}
      />
    </section>
  );
}

function DeleteAccountDialog({
  open,
  email,
  requiresPassword,
  onClose,
  onDeleted,
}: {
  open: boolean;
  email: string;
  requiresPassword: boolean;
  onClose: () => void;
  onDeleted: () => Promise<void>;
}) {
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await privacyService.deleteAccount({ confirmation, password });
      setConfirmation('');
      setPassword('');
      await onDeleted();
    } catch (cause) {
      setError(friendlyMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      title="Delete your account?"
      description="This removes the account, synced data, devices and integration access. Your local dashboard stays."
      onClose={busy ? () => undefined : onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Keep account
          </Button>
          <Button
            variant="danger"
            type="submit"
            form="delete-account-form"
            disabled={busy || confirmation.trim().toLowerCase() !== 'delete'}
          >
            {busy ? 'Deleting…' : 'Delete account'}
          </Button>
        </>
      }
    >
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      <form className="form-stack" id="delete-account-form" onSubmit={handleSubmit}>
        <p className="account-hint">
          Deleting <strong>{email}</strong> cannot be undone.
        </p>
        {requiresPassword ? (
          <Field label="Password" htmlFor="delete-password">
            <Input
              id="delete-password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
        ) : null}
        <Field label="Type “delete” to confirm" htmlFor="delete-confirmation">
          <Input
            id="delete-confirmation"
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </Field>
      </form>
    </Dialog>
  );
}
