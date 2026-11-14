import { useAccount } from '../../account/AccountProvider';
import { formatRelativeTime } from '../../lib/format';
import { useSync, type SyncStatus } from '../../sync/SyncProvider';

const LABELS: Record<SyncStatus, string> = {
  'signed-out': 'Not syncing',
  idle: 'Synced',
  syncing: 'Syncing…',
  pending: 'Waiting to sync',
  offline: 'Offline',
  error: 'Sync issue',
};

/** Small header indicator: what sync is doing right now. */
export function SyncStatusChip({ onOpen }: { onOpen: () => void }) {
  const { status } = useAccount();
  const { status: syncStatus, pendingCount, lastSyncedAt } = useSync();

  if (status !== 'signed-in') return null;

  const text =
    syncStatus === 'pending' && pendingCount > 0
      ? `${pendingCount} waiting`
      : LABELS[syncStatus];

  return (
    <button
      type="button"
      className={`sync-chip sync-chip--${syncStatus}`}
      onClick={onOpen}
      title={
        lastSyncedAt
          ? `Last synced ${formatRelativeTime(lastSyncedAt)} — open sync settings`
          : 'Open sync settings'
      }
    >
      <span className={`sync-dot sync-dot--${syncStatus}`} aria-hidden="true" />
      <span>{text}</span>
    </button>
  );
}
