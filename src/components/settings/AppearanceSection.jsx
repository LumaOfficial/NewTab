import { SEARCH_ENGINES } from '../../lib/defaults.js';
import { useDashboard } from '../../state/DashboardProvider.jsx';
import { Field } from '../ui/Field.jsx';
import { Input } from '../ui/Input.jsx';
import { SegmentedControl } from '../ui/SegmentedControl.jsx';

export function AppearanceSection() {
  const { state, actions } = useDashboard();
  const { theme, clockFormat, searchEngine, displayName } = state.settings;

  return (
    <section className="section">
      <header className="section__head">
        <h3>Appearance</h3>
        <p>Choose how Luma looks and reads on this device.</p>
      </header>

      <div className="section__card">
        <div className="row">
          <div className="row__text">
            <h4>Theme</h4>
            <p>System follows your operating system setting.</p>
          </div>
          <SegmentedControl
            label="Theme"
            value={theme}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            onChange={(value) => actions.setTheme(value)}
          />
        </div>

        <div className="row">
          <div className="row__text">
            <h4>Clock</h4>
            <p>Show time in 12-hour or 24-hour format.</p>
          </div>
          <SegmentedControl
            label="Clock format"
            value={clockFormat}
            options={[
              { value: '12h', label: '12-hour' },
              { value: '24h', label: '24-hour' },
            ]}
            onChange={(value) => actions.updateSettings({ clockFormat: value })}
          />
        </div>

        <div className="row">
          <div className="row__text">
            <h4>Search engine</h4>
            <p>Used when you search from the dashboard.</p>
          </div>
          <select
            className="input input--select"
            aria-label="Search engine"
            value={searchEngine}
            onChange={(event) => actions.updateSettings({ searchEngine: event.target.value })}
          >
            {SEARCH_ENGINES.map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.label}
              </option>
            ))}
          </select>
        </div>

        <Field label="Your name" hint="Used in the greeting. Stored only in this browser." htmlFor="display-name">
          <Input
            id="display-name"
            value={displayName}
            maxLength={40}
            placeholder="Add a name"
            onChange={(event) => actions.updateSettings({ displayName: event.target.value })}
          />
        </Field>
      </div>
    </section>
  );
}
