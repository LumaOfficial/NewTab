import { useState } from 'react';

import { hueFromText } from '../lib/color.js';
import { useDashboard } from '../state/DashboardProvider.jsx';
import { ShortcutDialog } from '../components/dialogs/ShortcutDialog.jsx';
import { IconButton } from '../components/ui/Button.jsx';
import { Menu } from '../components/ui/Menu.jsx';
import { WidgetShell } from '../components/widgets/WidgetShell.jsx';

function shortcutInitial(label) {
  const match = String(label).trim().match(/[a-z0-9]/i);
  return match ? match[0].toUpperCase() : '•';
}

export function ShortcutsWidget() {
  const { state, actions } = useDashboard();
  const [dialog, setDialog] = useState(null); // { shortcut } for edit, {} for create

  const { shortcuts } = state;
  const meta = shortcuts.length ? `${shortcuts.length} saved` : undefined;

  return (
    <WidgetShell
      id="shortcuts"
      title="Shortcuts"
      meta={meta}
      actions={<IconButton icon="plus" label="Add shortcut" onClick={() => setDialog({})} />}
    >
      {shortcuts.length === 0 ? (
        <div className="empty">
          <span className="empty__badge" aria-hidden="true">
            <IconButton icon="link" label="Shortcut" />
          </span>
          <p className="empty__title">No shortcuts yet</p>
          <p className="empty__text">Keep the sites you open most one click away.</p>
          <button type="button" className="link-button" onClick={() => setDialog({})}>
            Add your first shortcut
          </button>
        </div>
      ) : (
        <ul className="shortcut-grid">
          {shortcuts.map((shortcut) => (
            <li className="shortcut" key={shortcut.id}>
              <a className="shortcut__tile" href={shortcut.url} title={shortcut.url}>
                <span className="shortcut__avatar" style={{ '--hue': hueFromText(shortcut.label) }} aria-hidden="true">
                  {shortcutInitial(shortcut.label)}
                </span>
                <span className="shortcut__label">{shortcut.label}</span>
              </a>
              <div className="shortcut__menu">
                <Menu
                  label={`${shortcut.label} options`}
                  items={[
                    { label: 'Edit shortcut', icon: 'pencil', onSelect: () => setDialog({ shortcut }) },
                    { label: 'Remove shortcut', icon: 'trash', danger: true, onSelect: () => actions.removeShortcut(shortcut.id) },
                  ]}
                />
              </div>
            </li>
          ))}
          <li className="shortcut">
            <button type="button" className="shortcut__tile shortcut__tile--add" onClick={() => setDialog({})}>
              <span className="shortcut__avatar shortcut__avatar--add" aria-hidden="true">
                +
              </span>
              <span className="shortcut__label">Add</span>
            </button>
          </li>
        </ul>
      )}

      <ShortcutDialog open={Boolean(dialog)} shortcut={dialog?.shortcut} onClose={() => setDialog(null)} />
    </WidgetShell>
  );
}
