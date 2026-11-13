import { useEffect, useState } from 'react';

import { useDashboard } from '../../state/DashboardProvider.jsx';
import { Button } from '../ui/Button.jsx';
import { Dialog } from '../ui/Dialog.jsx';
import { Field } from '../ui/Field.jsx';
import { Textarea } from '../ui/Input.jsx';

/** Create/edit form for a note. Pass a `note` to edit it. */
export function NoteDialog({ open, note, onClose }) {
  const { actions } = useDashboard();
  const editing = Boolean(note);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setText(note?.text ?? '');
    setError('');
  }, [open, note]);

  const submit = (event) => {
    event.preventDefault();
    const result = editing ? actions.updateNote(note.id, text) : actions.addNote(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  };

  const remove = () => {
    if (note) actions.removeNote(note.id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      title={editing ? 'Edit note' : 'New note'}
      description="Notes stay on this device."
      onClose={onClose}
      footer={
        <>
          {editing ? (
            <Button variant="danger" size="sm" icon="trash" onClick={remove}>
              Delete
            </Button>
          ) : null}
          <span className="dialog__spacer" />
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="note-form">
            {editing ? 'Save note' : 'Add note'}
          </Button>
        </>
      }
    >
      <form id="note-form" className="form" onSubmit={submit} noValidate>
        <Field label="Note" error={error} hint="Plain text, up to 5,000 characters.">
          <Textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError('');
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit(event);
            }}
            placeholder="Capture a thought…"
            rows={6}
            maxLength={5000}
            aria-invalid={Boolean(error)}
            data-autofocus
          />
        </Field>
      </form>
    </Dialog>
  );
}
