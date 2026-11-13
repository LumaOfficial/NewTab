import { Brand, ThemeToggleButton } from './Brand.jsx';
import { Button } from '../ui/Button.jsx';
import { useDashboard } from '../../state/DashboardProvider.jsx';
import { useResolvedTheme } from '../../state/useResolvedTheme.js';

export function AppHeader() {
  const { state, actions } = useDashboard();
  const resolvedTheme = useResolvedTheme(state.settings.theme);

  return (
    <header className="topbar">
      <Brand />
      <div className="topbar__actions">
        <ThemeToggleButton
          resolvedTheme={resolvedTheme}
          onToggle={() => actions.setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        />
        <Button variant="secondary" size="sm" icon="settings" onClick={() => actions.openSettings('appearance')}>
          <span className="topbar__label">Settings</span>
        </Button>
      </div>
    </header>
  );
}
