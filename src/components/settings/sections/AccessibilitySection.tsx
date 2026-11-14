import { useEffect, useState } from 'react';
import { useDashboard } from '../../../state/DashboardProvider';
import type { KeyboardSettings, TextSpacing } from '../../../storage/schema';
import { formatShortcut, shortcutFromEvent } from '../../../lib/keyboard';
import { Button } from '../../ui/Button';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Switch } from '../../ui/Switch';
import { Badge } from '../../ui/Badge';
import { AccessibilityIcon, KeyboardIcon, MicIcon } from '../../icons';

const ACTIONS: Array<{ key: keyof KeyboardSettings; label: string; hint: string }> = [
  { key: 'focusSearch', label: 'Focus search', hint: 'Jump to the search box from anywhere.' },
  { key: 'newNote', label: 'New note', hint: 'Open a blank note from the dashboard.' },
  { key: 'focusTimer', label: 'Go to focus timer', hint: 'Scroll to the focus timer widget.' },
  {
    key: 'workspaceSwitcher',
    label: 'Workspaces',
    hint: 'Open workspace settings.',
  },
];

const DEFAULT_SHORTCUTS: KeyboardSettings = {
  focusSearch: 'mod+k',
  newNote: 'mod+shift+n',
  focusTimer: 'mod+shift+f',
  workspaceSwitcher: 'mod+shift+w',
};

export function AccessibilitySection() {
  const { data, dispatch } = useDashboard();
  const { accessibility, keyboard } = data.settings;
  const [capturing, setCapturing] = useState<keyof KeyboardSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!capturing) return undefined;

    const handle = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Escape') {
        setCapturing(null);
        return;
      }
      const combo = shortcutFromEvent(event);
      if (!combo) return;

      const conflict = ACTIONS.find(
        (action) => action.key !== capturing && keyboard[action.key] === combo,
      );
      if (conflict) {
        setError(`${formatShortcut(combo)} is already used for “${conflict.label}”.`);
        return;
      }

      dispatch({
        type: 'settings/patch',
        patch: { keyboard: { ...keyboard, [capturing]: combo } },
      });
      setError(null);
      setCapturing(null);
    };

    window.addEventListener('keydown', handle, true);
    return () => window.removeEventListener('keydown', handle, true);
  }, [capturing, dispatch, keyboard]);

  return (
    <section className="settings__section" aria-labelledby="settings-accessibility">
      <div>
        <h3 className="settings__section-title" id="settings-accessibility">
          Accessibility
        </h3>
        <p className="settings__section-intro">
          These options apply to this workspace. Focus outlines and screen-reader labels are always
          on.
        </p>
      </div>

      <div className="settings__group">
        <span className="settings__group-title">Comfort</span>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">High contrast</span>
            <span className="setting-row__hint">Stronger lines and bolder ink for readability.</span>
          </div>
          <Switch
            checked={accessibility.highContrast}
            label="High contrast"
            onChange={(highContrast) =>
              dispatch({
                type: 'settings/patch',
                patch: { accessibility: { ...accessibility, highContrast } },
              })
            }
          />
        </div>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Reduce motion</span>
            <span className="setting-row__hint">
              Stops background animation and widget transitions, and pauses background video.
            </span>
          </div>
          <Switch
            checked={accessibility.reducedMotion}
            label="Reduce motion"
            onChange={(reducedMotion) =>
              dispatch({
                type: 'settings/patch',
                patch: { accessibility: { ...accessibility, reducedMotion } },
              })
            }
          />
        </div>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Large text</span>
            <span className="setting-row__hint">Adds two pixels to the base text size.</span>
          </div>
          <Switch
            checked={accessibility.largeText}
            label="Large text"
            onChange={(largeText) =>
              dispatch({
                type: 'settings/patch',
                patch: { accessibility: { ...accessibility, largeText } },
              })
            }
          />
        </div>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Colour-blind-friendly accent</span>
            <span className="setting-row__hint">
              Swaps the accent for a high-contrast blue that stays distinct from the surfaces.
            </span>
          </div>
          <Switch
            checked={accessibility.colorBlindSafe}
            label="Colour-blind-friendly accent"
            onChange={(colorBlindSafe) =>
              dispatch({
                type: 'settings/patch',
                patch: { accessibility: { ...accessibility, colorBlindSafe } },
              })
            }
          />
        </div>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Text spacing</span>
            <span className="setting-row__hint">Adds room between lines and letters.</span>
          </div>
          <SegmentedControl<TextSpacing>
            label="Text spacing"
            value={accessibility.textSpacing}
            onChange={(textSpacing) =>
              dispatch({
                type: 'settings/patch',
                patch: { accessibility: { ...accessibility, textSpacing } },
              })
            }
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'wide', label: 'Wide' },
              { value: 'wider', label: 'Wider' },
            ]}
          />
        </div>
      </div>

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">
            <KeyboardIcon size={14} /> Keyboard shortcuts
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              dispatch({ type: 'settings/patch', patch: { keyboard: { ...DEFAULT_SHORTCUTS } } })
            }
          >
            Reset shortcuts
          </Button>
        </div>
        <ul className="shortcut-list">
          {ACTIONS.map((action) => (
            <li key={action.key} className="setting-row">
              <div className="setting-row__text">
                <span className="setting-row__label">{action.label}</span>
                <span className="setting-row__hint">{action.hint}</span>
              </div>
              <button
                type="button"
                className={`key-capture${capturing === action.key ? ' key-capture--active' : ''}`}
                aria-label={`Change shortcut for ${action.label}`}
                onClick={() => {
                  setCapturing(action.key);
                  setError(null);
                }}
              >
                {capturing === action.key ? 'Press keys…' : formatShortcut(keyboard[action.key])}
              </button>
            </li>
          ))}
        </ul>
        {capturing ? (
          <p className="widget-hint" role="status">
            Press the new key combination, or Escape to cancel.
          </p>
        ) : null}
        {error ? (
          <p className="field__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">
            <AccessibilityIcon size={14} /> Screen readers
          </span>
          <Badge muted>Always on</Badge>
        </div>
        <p className="widget-hint">
          Every control has a visible focus ring and a label. Widgets announce their state, the
          layout editor explains drag actions in text, and dialogs trap focus until closed.
        </p>
      </div>

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">
            <MicIcon size={14} /> Voice commands
          </span>
          <Badge muted>Not connected</Badge>
        </div>
        <p className="widget-hint">
          Voice control needs a speech service and microphone permission, neither of which this
          build requests. The architecture reserves a command layer, but no voice feature is
          simulated here.
        </p>
      </div>
    </section>
  );
}
