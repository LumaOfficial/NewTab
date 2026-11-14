import { useState, type CSSProperties } from 'react';
import { useDashboard } from '../../../state/DashboardProvider';
import { hostnameOf, hueFor, monogramFor } from '../../../lib/format';
import type { Shortcut } from '../../../storage/schema';
import { LinkIcon, PencilIcon, PlusIcon, TrashIcon } from '../../icons';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { EmptyState } from '../../ui/EmptyState';
import { IconButton } from '../../ui/IconButton';
import { ShortcutDialog } from '../../editors/ShortcutDialog';

export function ShortcutsSection() {
  const { data, dispatch } = useDashboard();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Shortcut | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Shortcut | null>(null);

  const openEditor = (shortcut: Shortcut | null) => {
    setEditing(shortcut);
    setEditorOpen(true);
  };

  return (
    <section className="settings__section" aria-labelledby="settings-shortcuts">
      <div>
        <h3 className="settings__section-title" id="settings-shortcuts">
          Shortcuts
        </h3>
        <p className="settings__section-intro">
          Manage the tiles on your new tab. Order matters — it is the order you see.
        </p>
      </div>

      <div>
        <Button variant="secondary" size="sm" icon={<PlusIcon size={15} />} onClick={() => openEditor(null)}>
          Add shortcut
        </Button>
      </div>

      {data.shortcuts.length === 0 ? (
        <div className="settings__group">
          <EmptyState
            icon={<LinkIcon size={20} />}
            title="No shortcuts saved"
            text="Add a website and it will appear as a tile on your dashboard."
          />
        </div>
      ) : (
        <div className="shortcut-rows">
          {data.shortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              className="shortcut-row"
              style={{ '--monogram-hue': hueFor(shortcut.url) } as CSSProperties}
            >
              <span className="shortcut-row__monogram" aria-hidden="true">
                {monogramFor(shortcut.title, shortcut.url)}
              </span>
              <span className="shortcut-row__text">
                <span className="shortcut-row__title">{shortcut.title}</span>
                <span className="shortcut-row__url">{hostnameOf(shortcut.url)}</span>
              </span>
              <IconButton label={`Edit ${shortcut.title}`} onClick={() => openEditor(shortcut)}>
                <PencilIcon size={16} />
              </IconButton>
              <IconButton
                label={`Delete ${shortcut.title}`}
                danger
                onClick={() => setPendingDelete(shortcut)}
              >
                <TrashIcon size={16} />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      <ShortcutDialog open={editorOpen} shortcut={editing} onClose={() => setEditorOpen(false)} />

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
    </section>
  );
}
