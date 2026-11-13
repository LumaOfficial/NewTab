import { useState } from 'react';

import { formatRelative } from '../lib/time.js';
import { useDashboard } from '../state/DashboardProvider.jsx';
import { NoteDialog } from '../components/dialogs/NoteDialog.jsx';
import { IconButton } from '../components/ui/Button.jsx';
import { WidgetShell } from '../components/widgets/WidgetShell.jsx';

export function NotesWidget() {
  const { state } = useDashboard();
  const [dialog, setDialog] = useState(null); // { note } for edit, {} for create

  const notes = [...state.notes].sort((a, b) => b.updatedAt - a.updatedAt);
  const meta = notes.length ? `${notes.length} saved` : undefined;

  return (
    <WidgetShell
      id="notes"
      title="Notes"
      meta={meta}
      actions={<IconButton icon="plus" label="New note" onClick={() => setDialog({})} />}
    >
      {notes.length === 0 ? (
        <div className="empty">
          <span className="empty__badge" aria-hidden="true">
            <IconButton icon="note" label="Note" />
          </span>
          <p className="empty__title">No notes yet</p>
          <p className="empty__text">Capture a thought — it stays on this device.</p>
          <button type="button" className="link-button" onClick={() => setDialog({})}>
            Write a note
          </button>
        </div>
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id}>
              <button type="button" className="note-row" onClick={() => setDialog({ note })}>
                <span className="note-row__text">{note.text}</span>
                <span className="note-row__time">{formatRelative(note.updatedAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <NoteDialog open={Boolean(dialog)} note={dialog?.note} onClose={() => setDialog(null)} />
    </WidgetShell>
  );
}
