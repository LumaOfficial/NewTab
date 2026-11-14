import { useDashboard } from '../../../state/DashboardProvider';
import {
  CLOCK_FORMATS,
  THEME_PREFERENCES,
  type ClockFormat,
  type SearchEngineId,
  type ThemePreference,
} from '../../../storage/schema';
import { SEARCH_ENGINES } from '../../../lib/searchEngines';
import { Field, Input, Select } from '../../ui/Field';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Switch } from '../../ui/Switch';
import { ClockIcon, MonitorIcon, MoonIcon, SunIcon } from '../../icons';

export function AppearanceSection() {
  const { data, dispatch } = useDashboard();
  const { settings } = data;

  return (
    <section className="settings__section" aria-labelledby="settings-appearance">
      <div>
        <h3 className="settings__section-title" id="settings-appearance">
          Appearance
        </h3>
        <p className="settings__section-intro">
          Pick how Luma looks and how the clock reads. Changes save as you go.
        </p>
      </div>

      <div className="settings__group">
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Theme</span>
            <span className="setting-row__hint">System follows your browser’s setting.</span>
          </div>
          <SegmentedControl<ThemePreference>
            label="Theme"
            value={settings.theme}
            onChange={(theme) => dispatch({ type: 'settings/patch', patch: { theme } })}
            options={THEME_PREFERENCES.map((value) => ({
              value,
              label: value === 'light' ? 'Light' : value === 'dark' ? 'Dark' : 'System',
              icon:
                value === 'light' ? (
                  <SunIcon size={15} />
                ) : value === 'dark' ? (
                  <MoonIcon size={15} />
                ) : (
                  <MonitorIcon size={15} />
                ),
            }))}
          />
        </div>

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Clock format</span>
            <span className="setting-row__hint">Uses your device’s local time.</span>
          </div>
          <SegmentedControl<ClockFormat>
            label="Clock format"
            value={settings.clockFormat}
            onChange={(clockFormat) => dispatch({ type: 'settings/patch', patch: { clockFormat } })}
            options={CLOCK_FORMATS.map((value) => ({
              value,
              label: value === '12h' ? '12-hour' : '24-hour',
              icon: <ClockIcon size={15} />,
            }))}
          />
        </div>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Search</p>
        <Field label="Search engine" htmlFor="settings-search-engine">
          <Select
            id="settings-search-engine"
            value={settings.searchEngine}
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: { searchEngine: event.target.value as SearchEngineId },
              })
            }
          >
            {SEARCH_ENGINES.map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Open results in a new tab</span>
            <span className="setting-row__hint">Keep your new tab in place when searching.</span>
          </div>
          <Switch
            checked={settings.searchInNewTab}
            label="Open search results in a new tab"
            onChange={(searchInNewTab) =>
              dispatch({ type: 'settings/patch', patch: { searchInNewTab } })
            }
          />
        </div>
      </div>

      <div className="settings__group">
        <p className="settings__group-title">Personalisation</p>
        <Field
          label="Your name"
          htmlFor="settings-display-name"
          hint="Used in your greeting. Leave it empty to keep it simple."
        >
          <Input
            id="settings-display-name"
            value={settings.displayName}
            maxLength={40}
            placeholder="Alex"
            autoComplete="given-name"
            onChange={(event) =>
              dispatch({ type: 'settings/patch', patch: { displayName: event.target.value } })
            }
          />
        </Field>
      </div>
    </section>
  );
}
