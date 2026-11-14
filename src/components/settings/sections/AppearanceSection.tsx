import { useDashboard } from '../../../state/DashboardProvider';
import {
  CLOCK_FORMATS,
  SEARCH_ENGINE_IDS,
  type ClockFormat,
  type SearchEngineId,
} from '../../../storage/schema';
import { resolveSearchTemplate, SEARCH_ENGINES } from '../../../lib/searchEngines';
import { Field, Input, Select } from '../../ui/Field';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Switch } from '../../ui/Switch';

export function AppearanceSection() {
  const { data, dispatch } = useDashboard();
  const { settings } = data;
  const customValid =
    settings.searchEngine !== 'custom' ||
    resolveSearchTemplate('custom', settings.customSearchUrl) !== '';

  return (
    <section className="settings__section" aria-labelledby="settings-appearance">
      <div>
        <h3 className="settings__section-title" id="settings-appearance">
          Appearance
        </h3>
        <p className="settings__section-intro">
          The essentials: your name, how the clock reads and where search goes. Colours and
          backgrounds live under Themes.
        </p>
      </div>

      <div className="settings__group">
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Colour mode</span>
            <span className="setting-row__hint">
              System follows your browser. Change the theme itself under Themes & background.
            </span>
          </div>
          <SegmentedControl
            label="Colour mode"
            value={settings.theme}
            onChange={(theme) => dispatch({ type: 'settings/patch', patch: { theme } })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </div>

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Clock</span>
            <span className="setting-row__hint">Applies to the clock and world clocks.</span>
          </div>
          <SegmentedControl<ClockFormat>
            label="Clock format"
            value={settings.clockFormat}
            onChange={(clockFormat) => dispatch({ type: 'settings/patch', patch: { clockFormat } })}
            options={CLOCK_FORMATS.map((format) => ({ value: format, label: format }))}
          />
        </div>

        <Field label="Your name" htmlFor="settings-name" hint="Used only in the greeting, on this device.">
          <Input
            id="settings-name"
            value={settings.displayName}
            maxLength={40}
            placeholder="What should Luma call you?"
            onChange={(event) =>
              dispatch({ type: 'settings/patch', patch: { displayName: event.target.value } })
            }
          />
        </Field>
      </div>

      <div className="settings__group">
        <span className="settings__group-title">Search</span>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Search engine</span>
            <span className="setting-row__hint">Used by the search widget and quick launch.</span>
          </div>
          <Select
            aria-label="Search engine"
            value={settings.searchEngine}
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: { searchEngine: event.target.value as SearchEngineId },
              })
            }
          >
            {SEARCH_ENGINES.filter((engine) =>
              (SEARCH_ENGINE_IDS as string[]).includes(engine.id),
            ).map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.label}
              </option>
            ))}
          </Select>
        </div>

        {settings.searchEngine === 'custom' ? (
          <Field
            label="Custom search URL"
            htmlFor="settings-custom-search"
            hint="Include %s where the query goes, e.g. https://example.com/search?q=%s. Only http(s) addresses are accepted."
            error={customValid ? undefined : 'That URL is not valid yet.'}
          >
            <Input
              id="settings-custom-search"
              value={settings.customSearchUrl}
              placeholder="https://example.com/search?q=%s"
              aria-invalid={!customValid}
              onChange={(event) =>
                dispatch({
                  type: 'settings/patch',
                  patch: { customSearchUrl: event.target.value },
                })
              }
            />
          </Field>
        ) : null}

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Suggestions</span>
            <span className="setting-row__hint">
              Shortcuts, notes, tasks, commands, calculations and unit conversion as you type.
            </span>
          </div>
          <Switch
            checked={settings.searchSuggestions}
            label="Enable search suggestions"
            onChange={(searchSuggestions) =>
              dispatch({ type: 'settings/patch', patch: { searchSuggestions } })
            }
          />
        </div>

        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Open results in a new tab</span>
            <span className="setting-row__hint">Turn off to search in the current tab.</span>
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
    </section>
  );
}
