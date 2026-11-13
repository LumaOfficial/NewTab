import { useEffect, useState } from 'react';

import { useDashboard } from '../../state/DashboardProvider.jsx';
import { Button } from '../ui/Button.jsx';
import { Dialog } from '../ui/Dialog.jsx';
import { Field } from '../ui/Field.jsx';
import { Input } from '../ui/Input.jsx';

/**
 * Create/edit form for a shortcut. Pass a `shortcut` to edit it, omit it to
 * add a new one. Validation errors come from the provider so the rules live
 * in one place.
 */
export function ShortcutDialog({ open, shortcut, onClose }) {
  const { actions } = useDashboard();
  const editing = Boolean(shortcut);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLabel(shortcut?.label ?? '');
    setUrl(shortcut?.url ?? '');
    setError('');
  }, [open, shortcut]);

  const submit = (event) => {
    event.preventDefault();
    const result = editing ? actions.updateShortcut(shortcut.id, { label, url }) : actions.addShortcut({ label, url });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  };

  const remove = () => {
    if (shortcut) actions.removeShortcut(shortcut.id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      title={editing ? 'Edit shortcut' : 'Add a shortcut'}
      description="Shortcuts are saved in this browser and work offline."
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
          <Button variant="primary" type="submit" form="shortcut-form">
            {editing ? 'Save changes' : 'Add shortcut'}
          </Button>
        </>
      }
    >
      <form id="shortcut-form" className="form" onSubmit={submit} noValidate>
        <Field label="Website address" error={error} hint="Paste a link, or type a domain like example.com">
          <Input
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError('');
            }}
            placeholder="example.com"
            aria-invalid={Boolean(error)}
            data-autofocus
            required
          />
        </Field>
        <Field label="Label" hint="Optional — defaults to the site name.">
          <Input value={label} maxLength={60} placeholder="Example" onChange={(event) => setLabel(event.target.value)} />
        </Field>
      </form>
    </Dialog>
  );
}
