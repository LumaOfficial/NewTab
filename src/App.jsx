import { AppHeader } from './components/layout/AppHeader.jsx';
import { WidgetGrid } from './components/dashboard/WidgetGrid.jsx';
import { SettingsPanel } from './components/settings/SettingsPanel.jsx';
import { Icon } from './components/ui/Icon.jsx';
import { APP_NAME, APP_VERSION } from './lib/meta.js';
import { useDashboard } from './state/DashboardProvider.jsx';

export default function App() {
  const { panel, actions, storageError } = useDashboard();

  return (
    <div className="app">
      <div className="app__aurora" aria-hidden="true" />

      <AppHeader />

      <main className="dashboard">
        {storageError ? (
          <div className="banner" role="alert">
            <span>
              <strong>Saving is unavailable.</strong> {storageError}
            </span>
            <button type="button" className="link-button" onClick={actions.dismissStorageError}>
              Dismiss
            </button>
          </div>
        ) : null}

        <WidgetGrid />
      </main>

      <footer className="app__footer">
        <span className="app__footer-item">
          <Icon name="lock" size={13} /> Saved on this device · works offline
        </span>
        <span className="app__footer-item">
          {APP_NAME} v{APP_VERSION}
        </span>
      </footer>

      <SettingsPanel
        open={panel.open}
        section={panel.section}
        onSelectSection={actions.setSettingsSection}
        onClose={actions.closeSettings}
      />
    </div>
  );
}
