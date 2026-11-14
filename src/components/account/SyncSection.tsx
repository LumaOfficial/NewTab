import { useState } from 'react';
import { formatRelativeTime } from '../../lib/format';
import { SYNC_CATEGORIES, type SyncCategoryId } from '../../sync/categories';
import { useSync } from '../../sync/SyncProvider';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { CloudIcon } from '../icons';
import { StatusNote, Spinner } from './StatusNote';
import { SyncConflictDialog } from './SyncConflictDialog';

const STATUS_LABEL: Record<string, string> = {
  idle: 'All changes synced',
  syncing: 'Syncing now…',
  pending: 'Changes waiting to sync',
  offline: 'Offline — changes are saved on this device',
  error: 'Sync needs attention',
  'signed-out': 'Not signed in',
};

export function SyncSection() {
  const {
    status,
    autoSync,
    categories,
    enabledCount,
    lastSyncedAt,
    pendingCount,
    error,
    conflicts,
    syncNow,
    setAutoSync,
    setCategoryEnabled,
    clearError,
  } = useSync();

  const [busy, setBusy] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);

  const handleSync = async () => {
    setBusy(true);
    clearError();
    await syncNow();
    setBusy(false);
  };

  return (
    <section className="account-section" aria-labelledby="account-sync">
      <div>
        <h3 className="settings__section-title" id="account-sync">
          Sync
        </h3>
        <p className="settings__section-intro">
          Everything is synced by default. Turn off anything you would rather keep on this device
          only.
        </p>
      </div>

      <div className="sync-summary">
        <div className="sync-summary__state">
          <span className={`sync-dot sync-dot--${status}`} aria-hidden="true" />
          <div>
            <span className="sync-summary__label">{STATUS_LABEL[status] ?? status}</span>
            <span className="sync-summary__meta">
              {lastSyncedAt
                ? `Last synced ${formatRelativeTime(lastSyncedAt)}`
                : 'Not synced yet on this device'}
              {pendingCount > 0 ? ` · ${pendingCount} ${pendingCount === 1 ? 'category' : 'categories'} waiting` : ''}
            </span>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<CloudIcon size={15} />}
          disabled={busy || status === 'syncing'}
          onClick={() => void handleSync()}
        >
          {busy ? 'Syncing…' : 'Sync now'}
        </Button>
      </div>

      {status === 'offline' ? (
        <StatusNote tone="warning" title="Offline">
          Changes keep saving on this device and are sent automatically when the connection
          returns.
        </StatusNote>
      ) : null}

      {error ? (
        <StatusNote
          tone="error"
          title="Something needs attention"
          action={
            <Button size="sm" onClick={() => void handleSync()} disabled={busy}>
              Retry
            </Button>
          }
        >
          {error}
        </StatusNote>
      ) : null}

      {conflicts.length > 0 ? (
        <StatusNote
          tone="warning"
          title={`${conflicts.length} ${conflicts.length === 1 ? 'category has' : 'categories have'} two versions`}
          action={
            <Button size="sm" variant="primary" onClick={() => setConflictOpen(true)}>
              Review
            </Button>
          }
        >
          Those categories stay out of sync until you choose which version to keep.
        </StatusNote>
      ) : null}

      <div className="settings__group">
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Automatic sync</span>
            <span className="setting-row__hint">
              Sends changes a moment after you make them. Manual sync always works.
            </span>
          </div>
          <Switch
            checked={autoSync}
            label="Automatic sync"
            onChange={(value) => void setAutoSync(value)}
          />
        </div>
      </div>

      <div className="settings__group">
        <div className="sync-group-head">
          <p className="settings__group-title">What syncs</p>
          <span className="sync-group-count">
            {enabledCount} of {SYNC_CATEGORIES.length} on
          </span>
        </div>

        {SYNC_CATEGORIES.map((category) => (
          <div className="setting-row" key={category.id}>
            <div className="setting-row__text">
              <span className="setting-row__label">{category.label}</span>
              <span className="setting-row__hint">{category.description}</span>
            </div>
            <Switch
              checked={categories[category.id] === true}
              label={`Sync ${category.label}`}
              onChange={(value) => void setCategoryEnabled(category.id as SyncCategoryId, value)}
            />
          </div>
        ))}

        <p className="account-hint">
          Integration connections live on your account and follow you automatically; only the
          preference switches above are stored on this device.
        </p>
      </div>

      {busy && status === 'syncing' ? <Spinner label="Checking for changes…" /> : null}

      <SyncConflictDialog open={conflictOpen} onClose={() => setConflictOpen(false)} />
    </section>
  );
}
