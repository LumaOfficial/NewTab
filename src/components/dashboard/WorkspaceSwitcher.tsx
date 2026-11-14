import { useId, useState, type FormEvent } from 'react';
import { useDashboard } from '../../state/DashboardProvider';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Field, Input, Select } from '../ui/Field';
import { Menu } from '../ui/Menu';
import { PlusIcon, LayersIcon } from '../icons';
import type { WorkspaceKind } from '../../storage/schema';

export function WorkspaceSwitcher({ onManage }: { onManage: () => void }) {
  const { workspaces, workspace, dispatch } = useDashboard();
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState<WorkspaceKind>('custom');
  const [name, setName] = useState('');
  const formId = useId();

  const openCreate = (nextKind: WorkspaceKind) => {
    setKind(nextKind);
    setName(nextKind === 'guest' ? 'Guest' : '');
    setCreating(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim() || (kind === 'guest' ? 'Guest' : 'New workspace');
    dispatch({ type: 'workspace/create', name: trimmed, kind, inheritTheme: true });
    setCreating(false);
  };

  return (
    <>
      <Menu
        label="Switch workspace"
        triggerClassName="workspace-chip"
        trigger={
          <span className="workspace-chip__inner">
            <span className="workspace-chip__icon" aria-hidden="true">
              {workspace.icon}
            </span>
            <span className="workspace-chip__name">{workspace.name}</span>
          </span>
        }
        items={[
          ...workspaces.map((entry) => ({
            id: `switch-${entry.id}`,
            label: entry.id === workspace.id ? `${entry.icon} ${entry.name} · current` : `${entry.icon} ${entry.name}`,
            icon: <LayersIcon size={15} />,
            onSelect: () => dispatch({ type: 'workspace/switch', id: entry.id }),
          })),
          {
            id: 'create',
            label: 'New workspace…',
            icon: <PlusIcon size={15} />,
            separatorBefore: true,
            onSelect: () => openCreate('custom'),
          },
          {
            id: 'guest',
            label: 'Temporary guest workspace',
            onSelect: () => openCreate('guest'),
          },
          {
            id: 'manage',
            label: 'Manage workspaces',
            separatorBefore: true,
            onSelect: onManage,
          },
        ]}
      />

      <Dialog
        open={creating}
        title="New workspace"
        description="Each workspace keeps its own theme, layout, widgets, notes, tasks, shortcuts and calendar."
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
          <Field label="Name" htmlFor="workspace-name">
            <Input
              id="workspace-name"
              value={name}
              maxLength={40}
              autoFocus
              placeholder={kind === 'guest' ? 'Guest' : 'e.g. Thesis'}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field
            label="Type"
            htmlFor="workspace-kind"
            hint={
              kind === 'guest'
                ? 'A guest workspace is temporary: delete it when you are done to remove its data.'
                : 'The type only organises your switcher; every workspace works the same way.'
            }
          >
            <Select
              id="workspace-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as WorkspaceKind)}
            >
              <option value="personal">Personal</option>
              <option value="school">School</option>
              <option value="work">Work</option>
              <option value="custom">Custom</option>
              <option value="guest">Guest (temporary)</option>
            </Select>
          </Field>
        </form>
      </Dialog>
    </>
  );
}
