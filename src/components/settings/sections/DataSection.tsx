import { useState } from 'react';
import { useDashboard } from '../../../state/DashboardProvider';
import { storageLocationLabel } from '../../../extension/context';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { ResetIcon } from '../../icons';

export function DataSection() {
  const { data, storageKind, resetDashboard, workspaces, workspace } = useDashboard();
  const visibleWidgets = data.settings.layout.entries.filter(
    (entry) => !data.settings.hiddenWidgets.includes(entry.id),
  ).length;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const counts = [
    { label: 'Workspaces', value: workspaces.length },
    { label: `Widgets in ${workspace.name}`, value: visibleWidgets },
    { label: 'Shortcuts', value: data.shortcuts.length },
    { label: 'Notes', value: data.notes.length },
    { label: 'Tasks', value: data.tasks.length },
    { label: 'Calendar events', value: data.events.length },
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
        <p className="settings__group-title">Reset this workspace</p>
        <p className="reset-note">
          Restores “{workspace.name}” to the default theme, complete layout and search settings,
          and removes its shortcuts, notes, tasks and events. Other workspaces are untouched.
          You’ll be asked to confirm.
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
        title="Reset this workspace to defaults?"
        description="This workspace’s theme, layout, shortcuts, notes, tasks and events will be cleared. Other workspaces stay as they are."
        confirmLabel="Reset workspace"
        onConfirm={resetDashboard}
        onClose={() => setConfirmOpen(false)}
      />
    </section>
  );
}
