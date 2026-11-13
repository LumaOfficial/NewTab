import { useState } from 'react';

import { hueFromText } from '../../lib/color.js';
import { useDashboard } from '../../state/DashboardProvider.jsx';
import { ShortcutDialog } from '../dialogs/ShortcutDialog.jsx';
import { Button, IconButton } from '../ui/Button.jsx';
import { Field } from '../ui/Field.jsx';
import { Input } from '../ui/Input.jsx';

export function ShortcutsSection() {
  const { state, actions } = useDashboard();
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const result = actions.addShortcut({ label, url });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLabel('');
    setUrl('');
    setError('');
  };

  return (
    <section className="section">
      <header className="section__head">
        <h3>Shortcuts</h3>
        <p>Add the sites you use most, then reorder or edit them here at any time.</p>
      </header>

      <form className="section__card shortcut-form" onSubmit={submit} noValidate>
        <Field label="Website address" error={error} htmlFor="shortcut-url">
          <Input
            id="shortcut-url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError('');
            }}
            placeholder="example.com"
            aria-invalid={Boolean(error)}
          />
        </Field>
        <Field label="Label" hint="Optional" htmlFor="shortcut-label">
          <Input id="shortcut-label" value={label} maxLength={60} placeholder="Example" onChange={(event) => setLabel(event.target.value)} />
        </Field>
        <div className="shortcut-form__submit">
          <Button variant="primary" type="submit" icon="plus">
            Add shortcut
          </Button>
        </div>
      </form>

      <div className="section__card section__card--tight">
        {state.shortcuts.length === 0 ? (
          <p className="section__empty">No shortcuts yet. Add your first one above.</p>
        ) : (
          state.shortcuts.map((shortcut, index) => (
            <div className="row row--divide" key={shortcut.id}>
              <div className="row__main">
                <span className="shortcut__avatar shortcut__avatar--sm" style={{ '--hue': hueFromText(shortcut.label) }} aria-hidden="true">
                  {shortcut.label.slice(0, 1).toUpperCase()}
                </span>
                <div className="row__text">
                  <h4>{shortcut.label}</h4>
                  <p>{shortcut.url}</p>
                </div>
              </div>
              <div className="row__actions">
                <IconButton
                  icon="arrowUp"
                  label={`Move ${shortcut.label} up`}
                  disabled={index === 0}
                  onClick={() => actions.moveShortcut(shortcut.id, -1)}
                />
                <IconButton
                  icon="arrowDown"
                  label={`Move ${shortcut.label} down`}
                  disabled={index === state.shortcuts.length - 1}
                  onClick={() => actions.moveShortcut(shortcut.id, 1)}
                />
                <IconButton icon="pencil" label={`Edit ${shortcut.label}`} onClick={() => setEditing(shortcut)} />
                <IconButton icon="trash" label={`Delete ${shortcut.label}`} onClick={() => actions.removeShortcut(shortcut.id)} />
              </div>
            </div>
          ))
        )}
      </div>

      <ShortcutDialog open={Boolean(editing)} shortcut={editing} onClose={() => setEditing(null)} />
    </section>
  );
}
