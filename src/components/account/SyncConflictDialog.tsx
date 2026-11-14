import { useState } from 'react';
import { formatRelativeTime } from '../../lib/format';
import { describeCategory, type SyncCategoryId } from '../../sync/categories';
import { useSync } from '../../sync/SyncProvider';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { EmptyState } from '../ui/EmptyState';
import { CheckIcon, CloudIcon } from '../icons';

/**
 * Local-versus-cloud comparison. Nothing is written until the person picks a
 * side, and each category is resolved on its own.
 */
export function SyncConflictDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { conflicts, resolveConflict } = useSync();
  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (id: SyncCategoryId, choice: 'local' | 'remote') => {
    setBusy(`${id}:${choice}`);
    await resolveConflict(id, choice);
    setBusy(null);
  };

  return (
    <Dialog
      open={open}
      wide
      title="Resolve sync conflicts"
      description="These changed here and on another device. Choose what to keep for each one."
      onClose={onClose}
    >
      {conflicts.length === 0 ? (
        <EmptyState
          icon={<CheckIcon size={20} />}
          title="Nothing to resolve"
          text="Every category is in sync. New conflicts appear here if two devices edit at once."
        />
      ) : (
        <div className="conflict-list">
          {conflicts.map((conflict) => (
            <div className="conflict" key={conflict.id}>
              <h4 className="conflict__title">{conflict.label}</h4>
              <div className="conflict__columns">
                <div className="conflict__side">
                  <span className="conflict__side-label">This device</span>
                  <ul className="conflict__facts">
                    {describeCategory(conflict.id, conflict.local).map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy !== null}
                    onClick={() => void decide(conflict.id, 'local')}
                  >
                    {busy === `${conflict.id}:local` ? 'Saving…' : 'Keep this device'}
                  </Button>
                </div>

                <div className="conflict__side conflict__side--cloud">
                  <span className="conflict__side-label">
                    <CloudIcon size={14} /> Cloud ·{' '}
                    {conflict.remoteUpdatedAt
                      ? formatRelativeTime(conflict.remoteUpdatedAt)
                      : 'unknown time'}
                  </span>
                  <ul className="conflict__facts">
                    {describeCategory(conflict.id, conflict.remote).map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy !== null}
                    onClick={() => void decide(conflict.id, 'remote')}
                  >
                    {busy === `${conflict.id}:remote` ? 'Applying…' : 'Keep cloud'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
