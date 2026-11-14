import { useId, useState, type FormEvent } from 'react';
import { useDashboard } from '../../../state/DashboardProvider';
import type { WorkspaceKind } from '../../../storage/schema';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Dialog } from '../../ui/Dialog';
import { Field, Input, Select } from '../../ui/Field';
import { IconButton } from '../../ui/IconButton';
import { PencilIcon, PlusIcon, TrashIcon } from '../../icons';
import { cx } from '../../../lib/utils';

const KIND_LABELS: Record<WorkspaceKind, string> = {
  personal: 'Personal',
  school: 'School',
  work: 'Work',
  custom: 'Custom',
  guest: 'Guest (temporary)',
};

export function WorkspacesSection() {
  const { workspaces, workspace, dispatch } = useDashboard();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<WorkspaceKind>('custom');
  const [rename, setRename] = useState<{ id: string; name: string; icon: string } | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const formId = useId();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({
      type: 'workspace/create',
      name: name.trim() || 'New workspace',
      kind,
      inheritTheme: true,
    });
    setName('');
    setCreating(false);
  };

  return (
    <section className="settings__section" aria-labelledby="settings-workspaces">
      <div>
        <h3 className="settings__section-title" id="settings-workspaces">
          Workspaces
        </h3>
        <p className="settings__section-intro">
          Each workspace keeps its own theme, background, widgets, layout, shortcuts, notes, tasks
          and calendar. No limit on how many you create.
        </p>
      </div>

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">{workspaces.length} workspaces</span>
          <Button variant="secondary" size="sm" icon={<PlusIcon size={15} />} onClick={() => setCreating(true)}>
            New workspace
          </Button>
        </div>
        <ul className="saved-list">
          {workspaces.map((entry) => (
            <li key={entry.id} className={cx('workspace-row', entry.id === workspace.id && 'workspace-row--active')}>
              <span className="workspace-row__icon" aria-hidden="true">
                {entry.icon}
              </span>
              <div className="saved-row__text">
                <span className="saved-row__name">
                  {entry.name} {entry.id === workspace.id ? <Badge>Current</Badge> : null}
                </span>
                <span className="saved-row__meta">
                  {KIND_LABELS[entry.kind]} · {entry.data.notes.length} notes ·{' '}
                  {entry.data.tasks.length} tasks
                </span>
              </div>
              <div className="saved-row__actions">
                {entry.id === workspace.id ? null : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'workspace/switch', id: entry.id })}
                  >
                    Switch
                  </Button>
                )}
                <IconButton
                  label={`Rename ${entry.name}`}
                  onClick={() => setRename({ id: entry.id, name: entry.name, icon: entry.icon })}
                >
                  <PencilIcon size={15} />
                </IconButton>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: 'workspace/duplicate', id: entry.id })}
                >
                  Duplicate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setResetId(entry.id)}>
                  Reset
                </Button>
                <IconButton
                  label={`Delete ${entry.name}`}
                  danger
                  disabled={workspaces.length <= 1}
                  onClick={() => setDeleteId(entry.id)}
                >
                  <TrashIcon size={15} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
        <p className="widget-hint">
          A guest workspace is a normal temporary workspace: delete it when you are done and its
          notes, tasks and settings go with it. Private and shared workspaces are planned but not
          implemented; nothing here pretends to collaborate.
        </p>
      </div>

      <Dialog
        open={creating}
        title="New workspace"
        description="It starts from the same theme and layout as the current workspace, with empty notes, tasks and shortcuts."
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form={formId}>
              Create workspace
            </Button>
          </>
        }
      >
        <form id={formId} className="form-stack" onSubmit={submit}>
          <Field label="Name" htmlFor="workspaces-name">
            <Input
              id="workspaces-name"
              value={name}
              autoFocus
              maxLength={40}
              placeholder="e.g. Thesis"
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Type" htmlFor="workspaces-kind">
            <Select
              id="workspaces-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as WorkspaceKind)}
            >
              {Object.entries(KIND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </form>
      </Dialog>

      <Dialog
        open={rename !== null}
        title="Rename workspace"
        onClose={() => setRename(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRename(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (rename) {
                  dispatch({ type: 'workspace/rename', id: rename.id, name: rename.name });
                  dispatch({ type: 'workspace/set-icon', id: rename.id, icon: rename.icon });
                }
                setRename(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Field label="Name" htmlFor="rename-workspace">
          <Input
            id="rename-workspace"
            value={rename?.name ?? ''}
            autoFocus
            maxLength={40}
            onChange={(event) =>
              setRename((current) => (current ? { ...current, name: event.target.value } : current))
            }
          />
        </Field>
        <Field label="Icon" htmlFor="rename-workspace-icon" hint="One emoji or letter.">
          <Input
            id="rename-workspace-icon"
            value={rename?.icon ?? ''}
            maxLength={4}
            onChange={(event) =>
              setRename((current) => (current ? { ...current, icon: event.target.value } : current))
            }
          />
        </Field>
      </Dialog>

      <ConfirmDialog
        open={resetId !== null}
        title="Reset this workspace?"
        description="Its theme, layout, notes, tasks, shortcuts and widget data return to defaults. Other workspaces are untouched."
        confirmLabel="Reset workspace"
        onConfirm={() => {
          if (resetId) dispatch({ type: 'workspace/reset', id: resetId });
        }}
        onClose={() => setResetId(null)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this workspace?"
        description="Its notes, tasks, shortcuts, theme and layout are removed from this device."
        confirmLabel="Delete workspace"
        onConfirm={() => {
          if (deleteId) dispatch({ type: 'workspace/delete', id: deleteId });
        }}
        onClose={() => setDeleteId(null)}
      />
    </section>
  );
}
