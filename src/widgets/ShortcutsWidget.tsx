import { useState, type CSSProperties } from 'react';
import { useDashboard } from '../state/DashboardProvider';
import { hueFor, monogramFor } from '../lib/format';
import { ArrowDownIcon, ArrowUpIcon, LinkIcon, PencilIcon, PlusIcon, TrashIcon } from '../components/icons';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Menu } from '../components/ui/Menu';
import { ShortcutDialog } from '../components/editors/ShortcutDialog';
import type { Shortcut } from '../storage/schema';
import { WidgetCard } from './WidgetCard';

export function ShortcutsWidget() {
  const { data, dispatch } = useDashboard();
  const { shortcuts } = data;

  const [editing, setEditing] = useState<Shortcut | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Shortcut | null>(null);

  const openEditor = (shortcut: Shortcut | null) => {
    setEditing(shortcut);
    setEditorOpen(true);
  };

  return (
    <WidgetCard
      title="Shortcuts"
      actions={
        <IconButton label="Add shortcut" onClick={() => openEditor(null)}>
          <PlusIcon size={17} />
        </IconButton>
      }
    >
      {shortcuts.length === 0 ? (
        <EmptyState
          icon={<LinkIcon size={20} />}
          title="No shortcuts yet"
          text="Pin the sites you open most often so they’re one click away."
          action={
            <Button variant="primary" size="sm" onClick={() => openEditor(null)}>
              Add your first shortcut
            </Button>
          }
        />
      ) : (
        <ul className="shortcut-grid">
          {shortcuts.map((shortcut, index) => (
            <li
              key={shortcut.id}
              className="shortcut"
              style={{ '--monogram-hue': hueFor(shortcut.url) } as CSSProperties}
            >
              <a
                className="shortcut__link"
                href={shortcut.url}
                target="_blank"
                rel="noreferrer noopener"
                title={shortcut.url}
              >
                <span className="shortcut__monogram">{monogramFor(shortcut.title, shortcut.url)}</span>
                <span className="shortcut__title">{shortcut.title}</span>
              </a>
              <div className="shortcut__menu">
                <Menu
                  label={`Options for ${shortcut.title}`}
                  items={[
                    {
                      id: 'edit',
                      label: 'Edit shortcut',
                      icon: <PencilIcon size={15} />,
                      onSelect: () => openEditor(shortcut),
                    },
                    {
                      id: 'move-earlier',
                      label: 'Move earlier',
                      icon: <ArrowUpIcon size={15} />,
                      disabled: index === 0,
                      onSelect: () =>
                        dispatch({ type: 'shortcut/move', id: shortcut.id, direction: -1 }),
                    },
                    {
                      id: 'move-later',
                      label: 'Move later',
                      icon: <ArrowDownIcon size={15} />,
                      disabled: index === shortcuts.length - 1,
                      onSelect: () =>
                        dispatch({ type: 'shortcut/move', id: shortcut.id, direction: 1 }),
                    },
                    {
                      id: 'delete',
                      label: 'Remove shortcut',
                      icon: <TrashIcon size={15} />,
                      danger: true,
                      separatorBefore: true,
                      onSelect: () => setPendingDelete(shortcut),
                    },
                  ]}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ShortcutDialog open={isEditorOpen} shortcut={editing} onClose={() => setEditorOpen(false)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove shortcut?"
        description={`“${pendingDelete?.title ?? ''}” will be removed from your new tab.`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (pendingDelete) dispatch({ type: 'shortcut/delete', id: pendingDelete.id });
        }}
        onClose={() => setPendingDelete(null)}
      />
    </WidgetCard>
  );
}
