import { useState } from 'react';
import { useDashboard } from '../../../state/DashboardProvider';
import { storageLocationLabel } from '../../../extension/context';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { ResetIcon } from '../../icons';

export function DataSection() {
  const { data, storageKind, resetDashboard } = useDashboard();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const counts = [
    { label: 'Shortcuts', value: data.shortcuts.length },
    { label: 'Notes', value: data.notes.length },
    { label: 'Tasks', value: data.tasks.length },
  ];

  return (
    <section className="settings__section" aria-labelledby="settings-data">
      <div>
        <h3 className="settings__section-title" id="settings-data">
          Data & storage
        </h3>
        <p className="settings__section-intro">
          Luma keeps everything in your browser. Nothing is uploaded anywhere.
        </p>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Where your data lives</p>
        <div className="info-block">
          <span>{storageLocationLabel(storageKind)}</span>
          <span>Saved automatically, and restored when the browser reopens.</span>
        </div>
        <div className="shortcut-rows">
          {counts.map((entry) => (
            <div key={entry.label} className="shortcut-row">
              <span className="shortcut-row__text">
                <span className="shortcut-row__title">{entry.label}</span>
                <span className="shortcut-row__url">Stored on this device</span>
              </span>
              <Badge muted>{entry.value}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Reset dashboard</p>
        <p className="reset-note">
          Restores the default theme, widget layout and search settings, and removes every
          shortcut, note and task. You’ll be asked to confirm.
        </p>
        <div>
          <Button
            variant="secondary"
            icon={<ResetIcon size={16} />}
            onClick={() => setConfirmOpen(true)}
          >
            Reset to defaults…
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Reset dashboard to defaults?"
        description="Your theme, widget layout, shortcuts, notes and tasks will all be cleared."
        confirmLabel="Reset everything"
        onConfirm={resetDashboard}
        onClose={() => setConfirmOpen(false)}
      />
    </section>
  );
}
