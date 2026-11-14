import { useState } from 'react';
import { formatRelativeTime } from '../../lib/format';
import { useDashboard } from '../../state/DashboardProvider';
import type { TrashEntry } from '../../storage/schema';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { RestoreIcon, TrashIcon } from '../icons';

const KIND_LABEL: Record<TrashEntry['kind'], string> = {
  note: 'Note',
  task: 'Task',
  shortcut: 'Shortcut',
};

export function TrashSection() {
  const { data, dispatch } = useDashboard();
  const [pending, setPending] = useState<TrashEntry | null>(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  return (
    <section className="account-section" aria-labelledby="account-trash">
      <div>
        <h3 className="settings__section-title" id="account-trash">
          Recently deleted
        </h3>
        <p className="settings__section-intro">
          Deleted notes, tasks and shortcuts wait here so nothing disappears by accident. The
          last 50 are kept on this device.
        </p>
      </div>

      {data.trash.length === 0 ? (
        <EmptyState
          icon={<TrashIcon size={20} />}
          title="Nothing deleted"
          text="When you delete a note, task or shortcut it lands here first."
        />
      ) : (
        <>
          <ul className="trash-list">
            {data.trash.map((entry) => (
              <li className="trash-row" key={entry.id}>
                <div className="trash-row__text">
                  <span className="trash-row__label">{entry.label}</span>
                  <span className="trash-row__meta">
                    {KIND_LABEL[entry.kind]} · deleted {formatRelativeTime(entry.deletedAt)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<RestoreIcon size={15} />}
                  onClick={() => dispatch({ type: 'trash/restore', id: entry.id })}
                >
                  Restore
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPending(entry)}>
                  Delete forever
                </Button>
              </li>
            ))}
          </ul>

          <div>
            <Button variant="ghost" icon={<TrashIcon size={15} />} onClick={() => setConfirmEmpty(true)}>
              Empty recently deleted
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="Delete forever?"
        description={`“${pending?.label ?? ''}” cannot be recovered after this.`}
        confirmLabel="Delete forever"
        onConfirm={() => {
          if (pending) dispatch({ type: 'trash/purge', id: pending.id });
          setPending(null);
        }}
        onClose={() => setPending(null)}
      />

      <ConfirmDialog
        open={confirmEmpty}
        title="Empty recently deleted?"
        description="Every item in the list is removed permanently."
        confirmLabel="Empty it"
        onConfirm={() => {
          dispatch({ type: 'trash/empty' });
          setConfirmEmpty(false);
        }}
        onClose={() => setConfirmEmpty(false)}
      />
    </section>
  );
}
