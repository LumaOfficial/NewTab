import { DashboardProvider } from './state/DashboardProvider';
import { NewTabPage } from './pages/NewTabPage';

export function App() {
  return (
    <DashboardProvider>
      <NewTabPage />
    </DashboardProvider>
  );
}
