import { useState } from 'react';
import { useDashboard } from '../state/DashboardProvider';
import { useThemePreference } from '../theme/useThemePreference';
import { Dashboard } from '../components/dashboard/Dashboard';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { LumaMark } from '../components/LumaMark';

/** The new-tab page: dashboard plus the settings drawer and storage warnings. */
export function NewTabPage() {
  const { data, status, storageError } = useDashboard();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useThemePreference(data.settings.theme);

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
      <Dashboard openSettings={() => setSettingsOpen(true)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {storageError ? (
        <p className="storage-banner" role="status">
          {storageError}
        </p>
      ) : null}
    </div>
  );
}
