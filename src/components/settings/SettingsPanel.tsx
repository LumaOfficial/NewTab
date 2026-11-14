import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/utils';
import { Dialog } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { CloudIcon, PlugIcon, ShieldIcon } from '../icons';
import { SETTINGS_SECTIONS, type SettingsSectionId } from './sections';
import { AppearanceSection } from './sections/AppearanceSection';
import { ThemesSection } from './sections/ThemesSection';
import { LayoutsSection } from './sections/LayoutsSection';
import { WidgetsSection } from './sections/WidgetsSection';
import { WorkspacesSection } from './sections/WorkspacesSection';
import { AccessibilitySection } from './sections/AccessibilitySection';
import { OnboardingSection } from './sections/OnboardingSection';
import { ShortcutsSection } from './sections/ShortcutsSection';
import { DataSection } from './sections/DataSection';
import { AboutSection } from './sections/AboutSection';
import { ComingSoonSection } from './sections/ComingSoonSection';
import { AccountLinkSection } from './sections/AccountLinkSection';
import { TrashSection } from '../account/TrashSection';
import type { AccountView } from '../../account/views';

function renderSection(id: SettingsSectionId, onOpenAccount: (view: AccountView) => void) {
  switch (id) {
    case 'appearance':
      return <AppearanceSection />;
    case 'themes':
      return <ThemesSection />;
    case 'layouts':
      return <LayoutsSection />;
    case 'widgets':
      return <WidgetsSection />;
    case 'workspaces':
      return <WorkspacesSection />;
    case 'accessibility':
      return <AccessibilitySection />;
    case 'onboarding':
      return <OnboardingSection />;
    case 'shortcuts':
      return <ShortcutsSection />;
    case 'data':
      return <DataSection />;
    case 'trash':
      return <TrashSection />;
    case 'about':
      return <AboutSection />;
    case 'accounts':
      return (
        <AccountLinkSection
          title="Account & sync"
          description="Sign in to keep themes, widgets, shortcuts, notes and tasks on every device. Your local dashboard keeps working offline either way."
          actionLabel="Open account & sync"
          icon={<CloudIcon size={16} />}
          onOpen={() => onOpenAccount('overview')}
        />
      );
    case 'integrations':
      return (
        <AccountLinkSection
          title="Integrations"
          description="Connect calendars, music, weather and more — one service at a time, each with its own permissions and its own disconnect button."
          actionLabel="Manage integrations"
          icon={<PlugIcon size={16} />}
          onOpen={() => onOpenAccount('integrations')}
        />
      );
    case 'privacy':
      return (
        <AccountLinkSection
          title="Privacy & security"
          description="See what stays on this device, what syncs, which services are connected, and how to export or delete your data."
          actionLabel="Open privacy controls"
          icon={<ShieldIcon size={16} />}
          onOpen={() => onOpenAccount('privacy')}
        />
      );
    default:
      return <ComingSoonSection sectionId={id} />;
  }
}

export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onOpenAccount: (view: AccountView) => void;
  initialSection?: SettingsSectionId;
}

/**
 * Settings drawer. The navigation list is data-driven, so a future phase can
 * turn a "soon" section into a real one by adding a component and dropping the
 * flag — the rest of the shell stays untouched.
 */
export function SettingsPanel({ open, onClose, onOpenAccount, initialSection }: SettingsPanelProps) {
  const [active, setActive] = useState<SettingsSectionId>(initialSection ?? 'appearance');
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) setActive(initialSection ?? 'appearance');
  }, [open, initialSection]);

  useEffect(() => {
    const current = navRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [active]);

  return (
    <Dialog
      open={open}
      variant="panel"
      title="Settings"
      description="Everything is saved on this device."
      onClose={onClose}
    >
      <div className="settings">
        <nav className="settings__nav" aria-label="Settings sections" ref={navRef}>
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

        <div className="settings__content">{renderSection(active, onOpenAccount)}</div>
      </div>
    </Dialog>
  );
}
