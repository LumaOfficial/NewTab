import { useCallback, useState } from 'react';
import { useDashboard } from '../state/DashboardProvider';
import { useThemePreference } from '../theme/useThemePreference';
import { Dashboard } from '../components/dashboard/Dashboard';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { AccountPanel } from '../components/account/AccountPanel';
import { LumaMark } from '../components/LumaMark';
import type { AccountView } from '../account/views';

/** The new-tab page: dashboard plus the settings and account panels. */
export function NewTabPage() {
  const { data, status, storageError } = useDashboard();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountView, setAccountView] = useState<AccountView>('overview');

  useThemePreference(data.settings.theme);

  const openAccount = useCallback((view: AccountView = 'overview') => {
    setAccountView(view);
    setAccountOpen(true);
  }, []);

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
      <Dashboard
        openSettings={() => setSettingsOpen(true)}
        openAccount={openAccount}
      />
      <SettingsPanel
        open={settingsOpen}
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
      {storageError ? (
        <p className="storage-banner" role="status">
          {storageError}
        </p>
      ) : null}
    </div>
  );
}
