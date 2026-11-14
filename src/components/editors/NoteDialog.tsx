import { useId, useState, type FormEvent } from 'react';
import { useDashboard } from '../../state/DashboardProvider';
import { createId } from '../../lib/utils';
import type { Note } from '../../storage/schema';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Field, Input, Textarea } from '../ui/Field';

export interface NoteDialogProps {
  open: boolean;
  note?: Note | null;
  onClose: () => void;
}

export function NoteDialog({ open, note = null, onClose }: NoteDialogProps) {
  const formId = useId();
  const isEditing = note !== null;

  return (
    <Dialog
      open={open}
      wide
      title={isEditing ? 'Edit note' : 'New note'}
      description="Notes are saved on this device only."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            {isEditing ? 'Save note' : 'Add note'}
          </Button>
        </>
      }
    >
      {/* Keyed on the note so each opening starts from a clean, correct form. */}
      <NoteForm key={note?.id ?? 'new'} formId={formId} note={note} onSaved={onClose} />
    </Dialog>
  );
}

interface NoteFormProps {
  formId: string;
  note: Note | null;
  onSaved: () => void;
}

function NoteForm({ formId, note, onSaved }: NoteFormProps) {
  const { dispatch } = useDashboard();
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle && !trimmedBody) {
      setError('Write something in your note first.');
      return;
    }

    if (note) {
      dispatch({ type: 'note/update', id: note.id, patch: { title: trimmedTitle, body } });
    } else {
      dispatch({
        type: 'note/add',
        note: {
          id: createId('note'),
          title: trimmedTitle,
          body,
          updatedAt: Date.now(),
          pinned: false,
        },
      });
    }

    onSaved();
  };

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="form-stack">
      <Field label="Title" htmlFor="note-title" hint="Optional.">
        <Input
          id="note-title"
          value={title}
          maxLength={80}
          placeholder="Groceries, ideas, follow-ups…"
          onChange={(event) => setTitle(event.target.value)}
          data-autofocus
        />
      </Field>
      <Field
        label="Note"
        htmlFor="note-body"
        error={error ?? undefined}
        hint="Plain text — line breaks are kept."
      >
        <Textarea
          id="note-body"
          value={body}
          placeholder="Start typing…"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'note-body-error' : undefined}
          onChange={(event) => {
            setBody(event.target.value);
            if (error) setError(null);
          }}
        />
      </Field>
    </form>
  );
}
