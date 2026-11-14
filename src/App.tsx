import { DashboardProvider } from './state/DashboardProvider';
import { AccountProvider } from './account/AccountProvider';
import { SyncProvider } from './sync/SyncProvider';
import { NewTabPage } from './pages/NewTabPage';

export function App() {
  return (
    <DashboardProvider>
      <AccountProvider>
        <SyncProvider>
          <NewTabPage />
        </SyncProvider>
      </AccountProvider>
    </DashboardProvider>
  );
}
