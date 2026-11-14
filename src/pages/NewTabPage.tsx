import { useCallback, useEffect, useState } from 'react';
import { useDashboard } from '../state/DashboardProvider';
import { useAppliedTheme } from '../theme/useAppliedTheme';
import { Dashboard } from '../components/dashboard/Dashboard';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { AccountPanel } from '../components/account/AccountPanel';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { NoteDialog } from '../components/editors/NoteDialog';
import { LumaMark } from '../components/LumaMark';
import { matchesShortcut } from '../lib/keyboard';
import type { AccountView } from '../account/views';
import type { SettingsSectionId } from '../components/settings/sections';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

/** The new-tab page: dashboard, onboarding, settings and account panels. */
export function NewTabPage() {
  const { data, status, storageError, onboarding, customThemes } = useDashboard();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSectionId | undefined>(undefined);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountView, setAccountView] = useState<AccountView>('overview');
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);

  const { keyboard } = data.settings;
  useAppliedTheme(data.settings, customThemes);

  const openAccount = useCallback((view: AccountView = 'overview') => {
    setAccountView(view);
    setAccountOpen(true);
  }, []);

  const openSettings = useCallback((section?: SettingsSectionId) => {
    setSettingsSection(section);
    setSettingsOpen(true);
  }, []);

  // Global shortcuts, all remappable in Settings → Accessibility.
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      if (matchesShortcut(event, keyboard.focusSearch)) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('luma:focus-search'));
        return;
      }

      if (matchesShortcut(event, keyboard.newNote)) {
        event.preventDefault();
        setQuickNoteOpen(true);
        return;
      }

      if (matchesShortcut(event, keyboard.workspaceSwitcher)) {
        event.preventDefault();
        openSettings('workspaces');
        return;
      }

      if (matchesShortcut(event, keyboard.focusTimer)) {
        event.preventDefault();
        const widget = document.querySelector('[data-widget-id="focus-timer"]');
        if (widget instanceof HTMLElement) {
          widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          openSettings('widgets');
        }
        return;
      }

      if (isTypingTarget(event.target)) return;
      if (event.key === '/') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('luma:focus-search'));
      }
    };

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keyboard, openSettings]);

  if (status === 'loading') {
    return (
      <div className="app app--loading">
        <div className="app__splash">
          <LumaMark size={30} />
          <span>Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Dashboard openSettings={openSettings} openAccount={openAccount} />
      <SettingsPanel
        open={settingsOpen}
        initialSection={settingsSection}
        onClose={() => setSettingsOpen(false)}
        onOpenAccount={(view) => {
          setSettingsOpen(false);
          openAccount(view);
        }}
      />
      <AccountPanel
        open={accountOpen}
        initialView={accountView}
        onClose={() => setAccountOpen(false)}
      />
      <NoteDialog open={quickNoteOpen} onClose={() => setQuickNoteOpen(false)} />
      {onboarding.status === 'pending' ? (
        <OnboardingWizard openAccount={openAccount} />
      ) : null}
      {storageError ? (
        <p className="storage-banner" role="status">
          {storageError}
        </p>
      ) : null}
    </div>
  );
}
