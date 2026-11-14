import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '../../state/DashboardProvider';
import { useSync } from '../../sync/SyncProvider';
import { useAccount } from '../../account/AccountProvider';
import { BUILT_IN_THEMES, THEME_CATEGORIES } from '../../theme/themes';
import { LAYOUT_PRESETS } from '../../widgets/presets';
import { getWidget, WIDGETS, WIDGET_CATEGORIES } from '../../widgets/catalogue';
import { SEARCH_ENGINES } from '../../lib/searchEngines';
import { cx } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Field';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Switch } from '../ui/Switch';
import { LumaMark } from '../LumaMark';
import { Dashboard } from '../dashboard/Dashboard';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlugIcon, SparkIcon } from '../icons';
import type { AccountView } from '../../account/views';
import type { LayoutPresetId } from '../../widgets/presets';
import type { SearchEngineId, ThemeCategoryId, ThemePreference } from '../../storage/schema';

const STEPS = [
  'Welcome',
  'Theme',
  'Appearance',
  'Layout',
  'Widgets',
  'Integrations',
  'Search',
  'Account',
  'Sync',
  'Workspace',
  'Preview',
] as const;

interface OnboardingWizardProps {
  openAccount: (view?: AccountView) => void;
}

export function OnboardingWizard({ openAccount }: OnboardingWizardProps) {
  const { data, workspace, dispatch, onboarding } = useDashboard();
  const { status: accountStatus } = useAccount();
  const { autoSync, categories, setAutoSync, setCategoryEnabled, enabledCount } = useSync();
  const [step, setStep] = useState(0);
  const [themeCategory, setThemeCategory] = useState<ThemeCategoryId>('minimal');
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [widgetFilter, setWidgetFilter] = useState('');

  const settings = data.settings;
  const hidden = new Set(settings.hiddenWidgets);

  useEffect(() => {
    setWorkspaceName(workspace.name);
  }, [workspace.id, workspace.name]);

  const visibleCount = settings.layout.entries.filter((entry) => !hidden.has(entry.id)).length;

  const filteredWidgets = useMemo(() => {
    const term = widgetFilter.trim().toLowerCase();
    if (!term) return WIDGETS;
    return WIDGETS.filter(
      (widget) =>
        widget.title.toLowerCase().includes(term) ||
        widget.description.toLowerCase().includes(term),
    );
  }, [widgetFilter]);

  const close = (status: 'completed' | 'skipped') => {
    if (workspaceName.trim() && workspaceName.trim() !== workspace.name) {
      dispatch({ type: 'workspace/rename', id: workspace.id, name: workspaceName });
    }
    dispatch({ type: 'onboarding/set', status });
  };

  const next = () => setStep((value) => Math.min(STEPS.length - 1, value + 1));
  const back = () => setStep((value) => Math.max(0, value - 1));

  const applyLayout = (preset: LayoutPresetId) => {
    dispatch({ type: 'layout/apply-preset', preset });
  };

  const renderStep = () => {
    switch (STEPS[step]) {
      case 'Welcome':
        return (
          <div className="onboarding__hero">
            <LumaMark size={44} />
            <h2>Welcome to Luma New Tab</h2>
            <p>
              A calm dashboard you shape yourself. This short setup picks a theme, a layout, your
              widgets and a search engine. Everything can be changed later, and nothing leaves this
              device unless you sign in for sync.
            </p>
            <ul className="onboarding__points">
              <li>
                <CheckIcon size={15} /> All core features are free, with no ads or limits.
              </li>
              <li>
                <CheckIcon size={15} /> Works offline with browser storage.
              </li>
              <li>
                <CheckIcon size={15} /> Skip anytime — the complete dashboard is already ready.
              </li>
            </ul>
          </div>
        );

      case 'Theme':
        return (
          <div className="onboarding__section">
            <h2>Choose a theme</h2>
            <p>Seven families, two themes each. Preview by selecting; apply with one click.</p>
            <div className="chip-row" role="tablist" aria-label="Theme categories">
              {THEME_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={themeCategory === category.id}
                  className={cx('chip', themeCategory === category.id && 'chip--active')}
                  onClick={() => setThemeCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="onboarding__themes">
              {BUILT_IN_THEMES.filter((theme) => theme.category === themeCategory).map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={cx(
                    'onboarding-theme',
                    settings.themeId === theme.id && 'onboarding-theme--active',
                  )}
                  onClick={() => dispatch({ type: 'theme/apply', themeId: theme.id })}
                >
                  <span className="onboarding-theme__swatches">
                    <span style={{ background: theme.light.bg }} />
                    <span style={{ background: theme.accent }} />
                    <span style={{ background: theme.dark.bg }} />
                    <span style={{ background: theme.dark.ink }} />
                  </span>
                  <span className="onboarding-theme__name">{theme.name}</span>
                  <span className="onboarding-theme__description">{theme.description}</span>
                  {settings.themeId === theme.id ? (
                    <span className="onboarding-theme__check">
                      <CheckIcon size={14} /> Applied
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        );

      case 'Appearance':
        return (
          <div className="onboarding__section">
            <h2>Light, dark or automatic</h2>
            <p>Automatic follows your system setting and changes with it.</p>
            <SegmentedControl<ThemePreference>
              label="Colour mode"
              value={settings.theme}
              onChange={(theme) => dispatch({ type: 'settings/patch', patch: { theme } })}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'Automatic' },
              ]}
            />
            <div className="onboarding__note">
              <SparkIcon size={16} />
              <span>
                Font size, transparency, blur, background and accessibility controls are in
                Settings → Themes & background after setup.
              </span>
            </div>
          </div>
        );

      case 'Layout':
        return (
          <div className="onboarding__section">
            <h2>Pick a starting layout</h2>
            <p>Every preset can be dragged and resized afterwards. The complete dashboard is the default.</p>
            <div className="onboarding__layouts">
              {LAYOUT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={cx(
                    'onboarding-layout',
                    settings.layout.mode === 'preset' &&
                      settings.layout.preset === preset.id &&
                      'onboarding-layout--active',
                  )}
                  onClick={() => applyLayout(preset.id)}
                >
                  <span className="onboarding-layout__label">{preset.label}</span>
                  <span className="onboarding-layout__description">{preset.description}</span>
                  <span className="onboarding-layout__count">
                    {preset.placements.length} widgets
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'Widgets':
        return (
          <div className="onboarding__section">
            <h2>Choose your widgets</h2>
            <p>
              {visibleCount} of {WIDGETS.length} widgets will appear on this workspace. Everything
              can be added or removed later from the widget library.
            </p>
            <div className="onboarding__widget-tools">
              <Input
                type="search"
                value={widgetFilter}
                placeholder="Search widgets…"
                aria-label="Search widgets"
                onChange={(event) => setWidgetFilter(event.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  for (const widget of WIDGETS) {
                    if (hidden.has(widget.id)) {
                      dispatch({ type: 'widget/toggle', id: widget.id, visible: true });
                    }
                  }
                }}
              >
                Enable all
              </Button>
            </div>
            <div className="onboarding__widgets">
              {WIDGET_CATEGORIES.map((category) => {
                const widgets = filteredWidgets.filter((widget) => widget.category === category.id);
                if (widgets.length === 0) return null;
                return (
                  <div key={category.id} className="onboarding__widget-group">
                    <p className="onboarding__widget-title">{category.label}</p>
                    <ul>
                      {widgets.map((widget) => {
                        const enabled = !hidden.has(widget.id);
                        return (
                          <li key={widget.id} className="onboarding__widget">
                            <div>
                              <span>{widget.title}</span>
                              <span className="onboarding__widget-desc">{widget.description}</span>
                            </div>
                            <Switch
                              checked={enabled}
                              label={`Show ${widget.title}`}
                              onChange={(visible) =>
                                dispatch({ type: 'widget/toggle', id: widget.id, visible })
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'Integrations':
        return (
          <div className="onboarding__section">
            <h2>Connect services — or skip</h2>
            <p>
              Calendars, music and weather need your permission and, for some services, server
              credentials. Luma never shows fake data for a connection that does not exist.
            </p>
            <div className="onboarding__note">
              <PlugIcon size={16} />
              <span>
                Integration status is managed in Account → Integrations. Widgets that need a
                service show a setup state until it is connected.
              </span>
            </div>
            <Button variant="secondary" onClick={() => openAccount('integrations')}>
              Open integrations
            </Button>
          </div>
        );

      case 'Search':
        return (
          <div className="onboarding__section">
            <h2>Default search engine</h2>
            <p>You can also add a custom engine URL later in Appearance settings.</p>
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
              {SEARCH_ENGINES.map((engine) => (
                <option key={engine.id} value={engine.id}>
                  {engine.label}
                </option>
              ))}
            </Select>
            {settings.searchEngine === 'custom' ? (
              <Input
                value={settings.customSearchUrl}
                placeholder="https://example.com/search?q=%s"
                aria-label="Custom search URL"
                onChange={(event) =>
                  dispatch({
                    type: 'settings/patch',
                    patch: { customSearchUrl: event.target.value },
                  })
                }
              />
            ) : null}
            <div className="setting-row onboarding__inline-toggle">
              <div className="setting-row__text">
                <span className="setting-row__label">Suggestions while typing</span>
                <span className="setting-row__hint">
                  Shortcuts, notes, tasks, commands, calculations and conversions.
                </span>
              </div>
              <Switch
                checked={settings.searchSuggestions}
                label="Search suggestions"
                onChange={(searchSuggestions) =>
                  dispatch({ type: 'settings/patch', patch: { searchSuggestions } })
                }
              />
            </div>
          </div>
        );

      case 'Account':
        return (
          <div className="onboarding__section">
            <h2>An account is optional</h2>
            <p>
              Signing in enables sync across devices and keeps your account data encrypted in
              transit and at rest. The dashboard works completely without one.
            </p>
            <div className="onboarding__note">
              <CheckIcon size={16} />
              <span>
                {accountStatus === 'signed-in'
                  ? 'You are already signed in. Continue to choose sync preferences.'
                  : 'Create an account now or continue offline — you can sign in at any time.'}
              </span>
            </div>
            {accountStatus === 'signed-in' ? null : (
              <div className="button-row">
                <Button variant="secondary" onClick={() => openAccount('overview')}>
                  Open account setup
                </Button>
              </div>
            )}
          </div>
        );

      case 'Sync':
        return (
          <div className="onboarding__section">
            <h2>Sync preferences</h2>
            {accountStatus === 'signed-in' ? (
              <>
                <p>{enabledCount} categories will sync automatically when you are online.</p>
                <div className="setting-row">
                  <div className="setting-row__text">
                    <span className="setting-row__label">Automatic sync</span>
                    <span className="setting-row__hint">
                      Push changes in the background and pull changes made elsewhere.
                    </span>
                  </div>
                  <Switch
                    checked={autoSync}
                    label="Automatic sync"
                    onChange={(value) => void setAutoSync(value)}
                  />
                </div>
                <ul className="onboarding__sync-list">
                  {(Object.keys(categories) as Array<keyof typeof categories>).map((id) => (
                    <li key={id} className="setting-row">
                      <span className="setting-row__label">{id}</span>
                      <Switch
                        checked={categories[id]}
                        label={`Sync ${id}`}
                        onChange={(value) => void setCategoryEnabled(id, value)}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="onboarding__note">
                <CheckIcon size={16} />
                <span>
                  Sync is off because no account is connected. Your data stays on this device. You
                  can turn sync on after signing in from Account → Sync.
                </span>
              </div>
            )}
          </div>
        );

      case 'Workspace':
        return (
          <div className="onboarding__section">
            <h2>Name your first workspace</h2>
            <p>
              This workspace holds its own theme, layout, widgets, notes, tasks and shortcuts. Add
              School, Work or Personal workspaces whenever you like.
            </p>
            <Input
              value={workspaceName}
              maxLength={40}
              aria-label="Workspace name"
              placeholder="Personal"
              onChange={(event) => setWorkspaceName(event.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                dispatch({
                  type: 'workspace/create',
                  name: 'School',
                  kind: 'school',
                  inheritTheme: true,
                })
              }
            >
              Also create a School workspace
            </Button>
            <p className="widget-hint">
              There is no limit on workspaces. Guest and custom workspaces are available too.
            </p>
          </div>
        );

      case 'Preview':
        return (
          <div className="onboarding__section onboarding__section--preview">
            <h2>Preview your dashboard</h2>
            <p>This is the real dashboard with the choices you just made.</p>
            <div className="onboarding-preview" aria-label="Dashboard preview">
              <Dashboard openSettings={() => undefined} openAccount={() => undefined} />
            </div>
            <ul className="onboarding__summary">
              <li>
                Theme: {settings.themeId} · {settings.theme}
              </li>
              <li>
                Layout:{' '}
                {settings.layout.mode === 'custom'
                  ? 'Custom'
                  : LAYOUT_PRESETS.find((preset) => preset.id === settings.layout.preset)?.label}
              </li>
              <li>
                Widgets: {visibleCount} of {WIDGETS.length}
              </li>
              <li>
                Search: {SEARCH_ENGINES.find((engine) => engine.id === settings.searchEngine)?.label}
              </li>
              <li>
                Workspace: {workspaceName || workspace.name} ·{' '}
                {accountStatus === 'signed-in' ? 'signed in' : 'offline, no account'}
              </li>
            </ul>
            {settings.layout.entries.some((entry) => !getWidget(entry.id)) ? (
              <p className="widget-hint">Some widgets in this layout are no longer available.</p>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding__panel">
        <header className="onboarding__header">
          <div className="onboarding__progress" aria-hidden="true">
            <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <p className="onboarding__step">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
          <button
            type="button"
            className="onboarding__skip"
            onClick={() => close(onboarding.status === 'pending' ? 'skipped' : 'completed')}
          >
            Skip setup
          </button>
        </header>

        <div className="onboarding__body" id="onboarding-title">
          {renderStep()}
        </div>

        <footer className="onboarding__footer">
          <Button variant="ghost" onClick={back} disabled={step === 0} icon={<ChevronLeftIcon size={16} />}>
            Back
          </Button>
          <div className="onboarding__footer-right">
            <span className="onboarding__hint">Changes save as you go.</span>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={next} icon={<ChevronRightIcon size={16} />}>
                Next
              </Button>
            ) : (
              <Button variant="primary" onClick={() => close('completed')}>
                Finish setup
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
