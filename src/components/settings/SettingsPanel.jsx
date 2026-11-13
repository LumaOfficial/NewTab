import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { SETTINGS_SECTIONS } from './sections.jsx';
import { IconButton } from '../ui/Button.jsx';
import { Icon } from '../ui/Icon.jsx';

/**
 * Full-height settings drawer. Sections are driven by SETTINGS_SECTIONS, so
 * adding a settings page is a one-line change there.
 */
export function SettingsPanel({ open, section, onSelectSection, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('is-locked');
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('is-locked');
    };
  }, [open, onClose]);

  if (!open) return null;

  const active = SETTINGS_SECTIONS.find((item) => item.id === section) ?? SETTINGS_SECTIONS[0];
  const ActiveSection = active.Component;

  return createPortal(
    <div className="settings" role="dialog" aria-modal="true" aria-label="Luma New Tab settings">
      <div className="settings__scrim" onClick={onClose} aria-hidden="true" />
      <div className="settings__panel">
        <header className="settings__head">
          <div>
            <p className="eyebrow">Luma New Tab</p>
            <h2 className="settings__title">Settings</h2>
          </div>
          <IconButton ref={closeRef} icon="close" label="Close settings" onClick={onClose} />
        </header>

        <div className="settings__layout">
          <nav className="settings__nav" aria-label="Settings sections">
            {SETTINGS_SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="settings__navbutton"
                aria-current={item.id === active.id ? 'page' : undefined}
                onClick={() => onSelectSection(item.id)}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
                {item.planned ? <span className="settings__later">Later</span> : null}
              </button>
            ))}
          </nav>

          <div className="settings__content">
            <ActiveSection {...active} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
