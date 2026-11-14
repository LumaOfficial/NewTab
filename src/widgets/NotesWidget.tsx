import { useState } from 'react';
import { useDashboard } from '../state/DashboardProvider';
import { formatRelativeTime } from '../lib/format';
import { NoteIcon, PencilIcon, PlusIcon, TrashIcon } from '../components/icons';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Menu } from '../components/ui/Menu';
import { NoteDialog } from '../components/editors/NoteDialog';
import type { Note } from '../storage/schema';
import { WidgetCard } from './WidgetCard';

const MAX_VISIBLE_NOTES = 4;

export function NotesWidget() {
  const { data, dispatch } = useDashboard();
  const [editing, setEditing] = useState<Note | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);

  const notes = data.notes.slice(0, MAX_VISIBLE_NOTES);
  const hiddenCount = data.notes.length - notes.length;

  const openEditor = (note: Note | null) => {
    setEditing(note);
    setEditorOpen(true);
  };

  return (
    <WidgetCard
      title="Notes"
      actions={
        <IconButton label="New note" onClick={() => openEditor(null)}>
          <PlusIcon size={17} />
        </IconButton>
      }
    >
      {data.notes.length === 0 ? (
        <EmptyState
          icon={<NoteIcon size={20} />}
          title="No notes yet"
          text="Keep a quick thought, list or reminder on your new tab."
          action={
            <Button variant="primary" size="sm" onClick={() => openEditor(null)}>
              Create a note
            </Button>
          }
        />
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id} className="note-row">
              <button type="button" className="note" onClick={() => openEditor(note)}>
                <span className="note__title">{note.title || 'Untitled note'}</span>
                {note.body.trim() ? <span className="note__excerpt">{note.body}</span> : null}
                <span className="note__meta">{formatRelativeTime(note.updatedAt)}</span>
              </button>
              <Menu
                label={`Options for ${note.title || 'untitled note'}`}
                items={[
                  {
                    id: 'edit',
                    label: 'Edit note',
                    icon: <PencilIcon size={15} />,
                    onSelect: () => openEditor(note),
                  },
                  {
                    id: 'delete',
                    label: 'Delete note',
                    icon: <TrashIcon size={15} />,
                    danger: true,
                    separatorBefore: true,
                    onSelect: () => setPendingDelete(note),
                  },
                ]}
              />
            </li>
          ))}
        </ul>
      )}

      {hiddenCount > 0 ? (
        <p className="task-footer">
          <span>
            {hiddenCount} more {hiddenCount === 1 ? 'note' : 'notes'} saved
          </span>
        </p>
      ) : null}

      <NoteDialog open={isEditorOpen} note={editing} onClose={() => setEditorOpen(false)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete note?"
        description={`“${pendingDelete?.title || 'Untitled note'}” will be deleted.`}
        confirmLabel="Delete note"
        onConfirm={() => {
          if (pendingDelete) dispatch({ type: 'note/delete', id: pendingDelete.id });
        }}
        onClose={() => setPendingDelete(null)}
      />
    </WidgetCard>
  );
}
