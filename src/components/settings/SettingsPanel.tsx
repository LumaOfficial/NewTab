import { useState } from 'react';
import { cx } from '../../lib/utils';
import { Dialog } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { SETTINGS_SECTIONS, type SettingsSectionId } from './sections';
import { AppearanceSection } from './sections/AppearanceSection';
import { WidgetsSection } from './sections/WidgetsSection';
import { ShortcutsSection } from './sections/ShortcutsSection';
import { DataSection } from './sections/DataSection';
import { AboutSection } from './sections/AboutSection';
import { ComingSoonSection } from './sections/ComingSoonSection';

function renderSection(id: SettingsSectionId) {
  switch (id) {
    case 'appearance':
      return <AppearanceSection />;
    case 'widgets':
      return <WidgetsSection />;
    case 'shortcuts':
      return <ShortcutsSection />;
    case 'data':
      return <DataSection />;
    case 'about':
      return <AboutSection />;
    default:
      return <ComingSoonSection sectionId={id} />;
  }
}

export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Settings drawer. The navigation list is data-driven, so a future phase can
 * turn a "soon" section into a real one by adding a component and dropping the
 * flag — the rest of the shell stays untouched.
 */
export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [active, setActive] = useState<SettingsSectionId>('appearance');

  return (
    <Dialog
      open={open}
      variant="panel"
      title="Settings"
      description="Everything is saved on this device."
      onClose={onClose}
    >
      <div className="settings">
        <nav className="settings__nav" aria-label="Settings sections">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={cx('settings__nav-item', section.soon && 'settings__nav-item--soon')}
              aria-current={section.id === active ? 'true' : undefined}
              onClick={() => setActive(section.id)}
            >
              <span>{section.label}</span>
              {section.soon ? <Badge muted>Soon</Badge> : null}
            </button>
          ))}
        </nav>

        <div className="settings__content">{renderSection(active)}</div>
      </div>
    </Dialog>
  );
}
