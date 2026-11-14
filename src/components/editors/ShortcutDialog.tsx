import { useId, useState, type FormEvent } from 'react';
import { useDashboard } from '../../state/DashboardProvider';
import { hostnameOf, normalizeShortcutUrl } from '../../lib/format';
import { createId } from '../../lib/utils';
import type { Shortcut } from '../../storage/schema';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Field, Input } from '../ui/Field';

export interface ShortcutDialogProps {
  open: boolean;
  /** Present when editing an existing shortcut, `null` when adding. */
  shortcut?: Shortcut | null;
  onClose: () => void;
}

export function ShortcutDialog({ open, shortcut = null, onClose }: ShortcutDialogProps) {
  const formId = useId();
  const isEditing = shortcut !== null;

  return (
    <Dialog
      open={open}
      title={isEditing ? 'Edit shortcut' : 'Add shortcut'}
      description="Shortcuts appear as tiles on your new tab."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            {isEditing ? 'Save changes' : 'Add shortcut'}
          </Button>
        </>
      }
    >
      {/* Keyed on the shortcut so each opening starts from a clean, correct form. */}
      <ShortcutForm
        key={shortcut?.id ?? 'new'}
        formId={formId}
        shortcut={shortcut}
        onSaved={onClose}
      />
    </Dialog>
  );
}

interface ShortcutFormProps {
  formId: string;
  shortcut: Shortcut | null;
  onSaved: () => void;
}

function ShortcutForm({ formId, shortcut, onSaved }: ShortcutFormProps) {
  const { dispatch } = useDashboard();
  const [title, setTitle] = useState(shortcut?.title ?? '');
  const [url, setUrl] = useState(shortcut?.url ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = normalizeShortcutUrl(url);
    if (!result.url) {
      setError(result.error ?? 'Enter a valid web address.');
      return;
    }

    const finalTitle = title.trim() || hostnameOf(result.url);

    if (shortcut) {
      dispatch({
        type: 'shortcut/update',
        id: shortcut.id,
        patch: { title: finalTitle, url: result.url },
      });
    } else {
      dispatch({
        type: 'shortcut/add',
        shortcut: { id: createId('shortcut'), title: finalTitle, url: result.url },
      });
    }

    onSaved();
  };

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="form-stack">
      <Field label="Name" htmlFor="shortcut-title" hint="Optional — defaults to the site name.">
        <Input
          id="shortcut-title"
          value={title}
          maxLength={40}
          placeholder="Design tools"
          onChange={(event) => setTitle(event.target.value)}
          data-autofocus
        />
      </Field>
      <Field
        label="Website address"
        htmlFor="shortcut-url"
        hint="For example example.com"
        error={error ?? undefined}
      >
        <Input
          id="shortcut-url"
          value={url}
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://example.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'shortcut-url-error' : undefined}
          onChange={(event) => {
            setUrl(event.target.value);
            if (error) setError(null);
          }}
        />
      </Field>
    </form>
  );
}
