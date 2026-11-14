import { useCallback, useEffect, useState } from 'react';
import { useAccount } from '../../account/AccountProvider';
import type { DeviceSummary } from '../../account/types';
import { formatRelativeTime } from '../../lib/format';
import { friendlyMessage } from '../../services/apiClient';
import { authService } from '../../services/authService';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { MonitorIcon, TrashIcon } from '../icons';
import { StatusNote, Spinner } from './StatusNote';

export function DevicesSection() {
  const { refreshSession, signOutEverywhere } = useAccount();
  const [devices, setDevices] = useState<DeviceSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<DeviceSummary | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const payload = await authService.devices();
      setDevices(payload.devices);
    } catch (cause) {
      setError(friendlyMessage(cause));
      setDevices([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revoke = async (device: DeviceSummary) => {
    setBusyId(device.id);
    setError(null);
    setNotice(null);
    try {
      const result = await authService.revokeDevice(device.id);
      setNotice(result.signedOutHere ? 'Signed out on this device.' : 'Device signed out.');
      await load();
      if (result.signedOutHere) await refreshSession();
    } catch (cause) {
      setError(friendlyMessage(cause));
    } finally {
      setBusyId(null);
      setPending(null);
    }
  };

  return (
    <section className="account-section" aria-labelledby="account-devices">
      <div>
        <h3 className="settings__section-title" id="account-devices">
          Connected devices
        </h3>
        <p className="settings__section-intro">
          Every browser with an active session. Removing a device signs it out immediately.
        </p>
      </div>

      {error ? (
        <StatusNote
          tone="error"
          action={
            <Button size="sm" onClick={() => void load()}>
              Try again
            </Button>
          }
        >
          {error}
        </StatusNote>
      ) : null}
      {notice ? <StatusNote tone="success">{notice}</StatusNote> : null}

      {devices === null ? (
        <Spinner label="Loading devices…" />
      ) : devices.length === 0 ? (
        <EmptyState
          icon={<MonitorIcon size={20} />}
          title="No other devices"
          text="This is the only browser signed in to your account right now."
        />
      ) : (
        <ul className="device-list">
          {devices.map((device) => (
            <li key={device.id} className="device-row">
              <span className="device-row__icon">
                <MonitorIcon size={17} />
              </span>
              <div className="device-row__text">
                <span className="device-row__label">
                  {device.label}
                  {device.current ? <span className="device-row__current">This device</span> : null}
                </span>
                <span className="device-row__meta">
                  Active {formatRelativeTime(device.lastSeenAt)} · signed in{' '}
                  {formatRelativeTime(device.createdAt)}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                icon={<TrashIcon size={15} />}
                disabled={busyId !== null}
                onClick={() => setPending(device)}
              >
                Sign out
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="settings__group">
        <p className="settings__group-title">Sign out everywhere</p>
        <p className="account-hint">
          Ends every session on this account. The dashboard on each device is kept.
        </p>
        <div>
          <Button variant="danger" onClick={() => setConfirmAll(true)}>
            Sign out all devices
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Sign out this device?"
        description={
          pending?.current
            ? 'You are signing out of the browser you are using now. Your dashboard stays on this device.'
            : 'That browser will need to sign in again. Its local dashboard is kept.'
        }
        confirmLabel="Sign out device"
        onConfirm={() => {
          if (pending) void revoke(pending);
        }}
        onClose={() => setPending(null)}
      />

      <ConfirmDialog
        open={confirmAll}
        title="Sign out on every device?"
        description="All browsers signed in to this account will be signed out immediately."
        confirmLabel="Sign out everywhere"
        onConfirm={() => {
          setConfirmAll(false);
          void signOutEverywhere();
        }}
        onClose={() => setConfirmAll(false)}
      />
    </section>
  );
}
