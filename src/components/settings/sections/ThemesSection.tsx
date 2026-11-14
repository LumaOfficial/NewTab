import { useState } from 'react';
import { useDashboard } from '../../../state/DashboardProvider';
import {
  BACKGROUND_KINDS,
  DENSITIES,
  FONT_CHOICES,
  SHADOW_STRENGTHS,
  type BackgroundKind,
  type Density,
  type FontChoice,
  type ShadowStrength,
  type ThemeCategoryId,
  type ThemePreference,
} from '../../../storage/schema';
import { readUrl } from '../../../storage/schema';
import {
  BUILT_IN_THEMES,
  THEME_CATEGORIES,
  getBuiltInTheme,
  type BuiltInTheme,
} from '../../../theme/themes';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Dialog } from '../../ui/Dialog';
import { Field, Input, Select } from '../../ui/Field';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Switch } from '../../ui/Switch';
import { Badge } from '../../ui/Badge';
import { IconButton } from '../../ui/IconButton';
import { PencilIcon, RestoreIcon, TrashIcon } from '../../icons';

function ThemePreview({ theme, mode }: { theme: BuiltInTheme; mode: 'light' | 'dark' }) {
  const palette = mode === 'dark' ? theme.dark : theme.light;
  return (
    <div className="theme-preview" style={{ background: palette.bg, color: palette.ink }}>
      <div
        className="theme-preview__card"
        style={{ background: palette.surfaceStrong, borderColor: palette.line }}
      >
        <span style={{ color: palette.inkFaint }}>WEDNESDAY · 9:41</span>
        <strong style={{ color: palette.ink }}>Good morning</strong>
        <span
          className="theme-preview__accent"
          style={{ background: theme.accent, color: palette.accentInk }}
        >
          Search
        </span>
      </div>
      <div className="theme-preview__swatches">
        <span style={{ background: theme.accent }} />
        <span style={{ background: theme.light.bg }} />
        <span style={{ background: theme.dark.bg }} />
        <span style={{ background: theme.dark.ink }} />
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  hint?: string;
}) {
  return (
    <div className="setting-row">
      <div className="setting-row__text">
        <span className="setting-row__label">{label}</span>
        {hint ? <span className="setting-row__hint">{hint}</span> : null}
      </div>
      <div className="color-control">
        <input
          type="color"
          aria-label={label}
          value={value ?? '#5b4bd8'}
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button type="button" className="text-button" onClick={() => onChange(null)}>
            Use theme colour
          </button>
        ) : (
          <span className="setting-row__hint">From theme</span>
        )}
      </div>
    </div>
  );
}

function SaveThemeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useDashboard();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ThemeCategoryId>('minimal');
  const formId = 'save-theme-form';

  return (
    <Dialog
      open={open}
      title="Save this theme"
      description="Saved themes are available to every workspace on this device."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            Save theme
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: 'theme/save-custom', name: name.trim() || 'My theme', category });
          setName('');
          onClose();
        }}
      >
        <Field label="Theme name" htmlFor="theme-name">
          <Input
            id="theme-name"
            value={name}
            autoFocus
            maxLength={40}
            placeholder="e.g. Evening paper"
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Category" htmlFor="theme-category">
          <Select
            id="theme-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as ThemeCategoryId)}
          >
            {THEME_CATEGORIES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Dialog>
  );
}

export function ThemesSection() {
  const { data, dispatch, customThemes, workspace } = useDashboard();
  const { settings } = data;
  const [category, setCategory] = useState<ThemeCategoryId>('minimal');
  const [preview, setPreview] = useState<BuiltInTheme | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  const themes = BUILT_IN_THEMES.filter((theme) => theme.category === category);
  const activeTheme = getBuiltInTheme(settings.themeId);
  const mode: 'light' | 'dark' =
    settings.theme === 'system'
      ? typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : settings.theme;
  const imageValid = !settings.background.imageUrl || readUrl(settings.background.imageUrl) !== '';
  const videoValid = !settings.background.videoUrl || readUrl(settings.background.videoUrl) !== '';

  const patchBackground = (patch: Partial<typeof settings.background>) =>
    dispatch({
      type: 'settings/patch',
      patch: { background: { ...settings.background, ...patch } },
    });

  return (
    <section className="settings__section" aria-labelledby="settings-themes">
      <div>
        <h3 className="settings__section-title" id="settings-themes">
          Themes & background
        </h3>
        <p className="settings__section-intro">
          This theme belongs to “{workspace.name}” only. Switching workspace switches the theme
          with it.
        </p>
      </div>

      <div className="settings__group">
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Colour mode</span>
            <span className="setting-row__hint">Every theme has a light and a dark palette.</span>
          </div>
          <SegmentedControl<ThemePreference>
            label="Colour mode"
            value={settings.theme}
            onChange={(theme) => dispatch({ type: 'settings/patch', patch: { theme } })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'Auto' },
            ]}
          />
        </div>
        <p className="widget-hint">
          Active theme: <strong>{customThemes.find((theme) => theme.id === settings.themeId)?.name ?? activeTheme.name}</strong>
        </p>
      </div>

      <div className="theme-tabs" role="tablist" aria-label="Theme categories">
        {THEME_CATEGORIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={entry.id === category}
            className={`chip${entry.id === category ? ' chip--active' : ''}`}
            onClick={() => setCategory(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="theme-grid">
        {themes.map((theme) => (
          <article key={theme.id} className="theme-card">
            <ThemePreview theme={theme} mode={mode} />
            <div className="theme-card__body">
              <div>
                <p className="theme-card__name">{theme.name}</p>
                <p className="theme-card__description">{theme.description}</p>
              </div>
              <div className="theme-card__actions">
                <Button variant="ghost" size="sm" onClick={() => setPreview(theme)}>
                  Preview
                </Button>
                <Button
                  variant={settings.themeId === theme.id ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => dispatch({ type: 'theme/apply', themeId: theme.id })}
                >
                  {settings.themeId === theme.id ? 'Applied' : 'Apply'}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="settings__group">
        <span className="settings__group-title">Background</span>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Background type</span>
            <span className="setting-row__hint">
              Pictures and video must be https addresses. Use assets you have the right to use.
            </span>
          </div>
          <Select
            aria-label="Background type"
            value={settings.background.kind}
            onChange={(event) => patchBackground({ kind: event.target.value as BackgroundKind })}
          >
            {BACKGROUND_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind === 'none' ? 'Theme default' : kind.charAt(0).toUpperCase() + kind.slice(1)}
              </option>
            ))}
          </Select>
        </div>

        {settings.background.kind === 'solid' ? (
          <ColorRow
            label="Background colour"
            value={settings.background.color}
            onChange={(color) => patchBackground({ color: color ?? '#f1efea' })}
          />
        ) : null}

        {settings.background.kind === 'gradient' ? (
          <>
            <ColorRow
              label="Gradient from"
              value={settings.background.gradientFrom}
              onChange={(color) => patchBackground({ gradientFrom: color ?? '#6f5bf0' })}
            />
            <ColorRow
              label="Gradient to"
              value={settings.background.gradientTo}
              onChange={(color) => patchBackground({ gradientTo: color ?? '#ffb076' })}
            />
            <div className="setting-row">
              <div className="setting-row__text">
                <span className="setting-row__label">Angle · {settings.background.gradientAngle}°</span>
                <span className="setting-row__hint">Animated gradients move slowly and stop with reduced motion.</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={settings.background.gradientAngle}
                aria-label="Gradient angle"
                onChange={(event) => patchBackground({ gradientAngle: Number(event.target.value) })}
              />
            </div>
            <div className="setting-row">
              <span className="setting-row__label">Animate gradient</span>
              <Switch
                checked={settings.background.animated}
                label="Animate gradient"
                onChange={(animated) => patchBackground({ animated })}
              />
            </div>
          </>
        ) : null}

        {settings.background.kind === 'image' ? (
          <Field
            label="Wallpaper URL"
            htmlFor="bg-image"
            hint="A direct https link to an image you have permission to use."
            error={imageValid ? undefined : 'Only http(s) addresses are accepted.'}
          >
            <Input
              id="bg-image"
              value={settings.background.imageUrl}
              placeholder="https://…/wallpaper.jpg"
              aria-invalid={!imageValid}
              onChange={(event) => patchBackground({ imageUrl: event.target.value })}
            />
          </Field>
        ) : null}

        {settings.background.kind === 'video' ? (
          <Field
            label="Video URL"
            htmlFor="bg-video"
            hint="A muted looping https video (mp4/webm). It pauses for reduced motion."
            error={videoValid ? undefined : 'Only http(s) addresses are accepted.'}
          >
            <Input
              id="bg-video"
              value={settings.background.videoUrl}
              placeholder="https://…/loop.mp4"
              aria-invalid={!videoValid}
              onChange={(event) => patchBackground({ videoUrl: event.target.value })}
            />
          </Field>
        ) : null}

        {settings.background.kind === 'image' || settings.background.kind === 'video' ? (
          <div className="setting-row">
            <div className="setting-row__text">
              <span className="setting-row__label">Dim · {settings.background.dim}%</span>
              <span className="setting-row__hint">Darkens the media so text stays readable.</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              value={settings.background.dim}
              aria-label="Background dimming"
              onChange={(event) => patchBackground({ dim: Number(event.target.value) })}
            />
          </div>
        ) : null}
      </div>

      <div className="settings__group">
        <span className="settings__group-title">Type & surface</span>
        <div className="setting-row">
          <span className="setting-row__label">Font</span>
          <Select
            aria-label="Font"
            value={settings.typography.font}
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: { typography: { ...settings.typography, font: event.target.value as FontChoice } },
              })
            }
          >
            {FONT_CHOICES.map((font) => (
              <option key={font} value={font}>
                {font === 'sans' ? 'Sans serif' : font.charAt(0).toUpperCase() + font.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <Field
          label="Custom font family"
          htmlFor="theme-custom-font"
          hint="Optional. A family already installed on your device, e.g. “Iowan Old Style”. Nothing is downloaded."
        >
          <Input
            id="theme-custom-font"
            value={settings.typography.customFont}
            placeholder="Iowan Old Style"
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: { typography: { ...settings.typography, customFont: event.target.value } },
              })
            }
          />
        </Field>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Font size · {settings.typography.size}px</span>
            <span className="setting-row__hint">Large text mode in Accessibility adds two more pixels.</span>
          </div>
          <input
            type="range"
            min={12}
            max={24}
            value={settings.typography.size}
            aria-label="Font size"
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: {
                  typography: { ...settings.typography, size: Number(event.target.value) },
                },
              })
            }
          />
        </div>
        <ColorRow
          label="Text colour"
          value={settings.typography.textColor}
          hint="Overrides the palette ink."
          onChange={(textColor) =>
            dispatch({
              type: 'settings/patch',
              patch: { typography: { ...settings.typography, textColor } },
            })
          }
        />
        <ColorRow
          label="Accent colour"
          value={settings.surface.accentColor}
          onChange={(accentColor) =>
            dispatch({
              type: 'settings/patch',
              patch: { surface: { ...settings.surface, accentColor } },
            })
          }
        />
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Widget transparency · {settings.surface.opacity}%</span>
            <span className="setting-row__hint">Lower values let more of the background through.</span>
          </div>
          <input
            type="range"
            min={40}
            max={100}
            value={settings.surface.opacity}
            aria-label="Widget transparency"
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: { surface: { ...settings.surface, opacity: Number(event.target.value) } },
              })
            }
          />
        </div>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Widget blur · {settings.surface.blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            value={settings.surface.blur}
            aria-label="Widget blur"
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: { surface: { ...settings.surface, blur: Number(event.target.value) } },
              })
            }
          />
        </div>
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">Corner radius · {settings.surface.radius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={28}
            value={settings.surface.radius}
            aria-label="Corner radius"
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: { surface: { ...settings.surface, radius: Number(event.target.value) } },
              })
            }
          />
        </div>
        <div className="setting-row">
          <span className="setting-row__label">Shadows</span>
          <Select
            aria-label="Shadows"
            value={settings.surface.shadow}
            onChange={(event) =>
              dispatch({
                type: 'settings/patch',
                patch: { surface: { ...settings.surface, shadow: event.target.value as ShadowStrength } },
              })
            }
          >
            {SHADOW_STRENGTHS.map((shadow) => (
              <option key={shadow} value={shadow}>
                {shadow.charAt(0).toUpperCase() + shadow.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <div className="setting-row">
          <span className="setting-row__label">Density</span>
          <SegmentedControl<Density>
            label="Dashboard density"
            value={settings.motion.density}
            onChange={(density) =>
              dispatch({ type: 'settings/patch', patch: { motion: { ...settings.motion, density } } })
            }
            options={DENSITIES.map((density) => ({
              value: density,
              label: density.charAt(0).toUpperCase() + density.slice(1),
            }))}
          />
        </div>
        <div className="setting-row">
          <span className="setting-row__label">Motion</span>
          <SegmentedControl
            label="Animation intensity"
            value={settings.motion.animation}
            onChange={(animation) =>
              dispatch({
                type: 'settings/patch',
                patch: { motion: { ...settings.motion, animation } },
              })
            }
            options={[
              { value: 'full', label: 'Full' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'none', label: 'None' },
            ]}
          />
        </div>
      </div>

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">Saved themes</span>
          <Button variant="secondary" size="sm" onClick={() => setSaveOpen(true)}>
            Save current theme
          </Button>
        </div>
        {customThemes.length === 0 ? (
          <p className="widget-hint">
            Adjust any colour above, then save the result as your own theme.
          </p>
        ) : (
          <ul className="saved-list">
            {customThemes.map((theme) => (
              <li key={theme.id} className="saved-row">
                <span className="saved-row__swatch" style={{ background: theme.recipe.accentColor }} />
                <div className="saved-row__text">
                  <span className="saved-row__name">{theme.name}</span>
                  <span className="saved-row__meta">
                    {THEME_CATEGORIES.find((entry) => entry.id === theme.category)?.label ?? theme.category}
                  </span>
                </div>
                {settings.themeId === theme.id ? <Badge>Applied</Badge> : null}
                <div className="saved-row__actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'theme/apply', themeId: theme.id })}
                  >
                    Apply
                  </Button>
                  <IconButton
                    label={`Rename ${theme.name}`}
                    onClick={() => setRenaming({ id: theme.id, name: theme.name })}
                  >
                    <PencilIcon size={15} />
                  </IconButton>
                  <IconButton
                    label={`Duplicate ${theme.name}`}
                    onClick={() => dispatch({ type: 'theme/duplicate-custom', id: theme.id })}
                  >
                    +
                  </IconButton>
                  <IconButton label={`Delete ${theme.name}`} danger onClick={() => setDeleteId(theme.id)}>
                    <TrashIcon size={15} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={<RestoreIcon size={15} />}
          onClick={() => setResetOpen(true)}
        >
          Reset theme settings
        </Button>
      </div>

      <Dialog
        open={preview !== null}
        title={preview ? `Preview · ${preview.name}` : 'Preview'}
        description={preview?.description}
        onClose={() => setPreview(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (preview) dispatch({ type: 'theme/apply', themeId: preview.id });
                setPreview(null);
              }}
            >
              Apply theme
            </Button>
          </>
        }
      >
        {preview ? (
          <div className="theme-preview-large" style={{ background: preview.light.bg }}>
            <div
              className="theme-preview-large__panel"
              style={{ background: preview.light.surfaceStrong, color: preview.light.ink }}
            >
              <span style={{ color: preview.light.inkFaint }}>Your dashboard</span>
              <h4 style={{ margin: 0 }}>Good morning, Alex</h4>
              <div className="theme-preview-large__row">
                <span
                  className="theme-preview__accent"
                  style={{ background: preview.accent, color: preview.light.accentInk }}
                >
                  Primary
                </span>
                <span
                  className="theme-preview__accent"
                  style={{ background: preview.light.bg, color: preview.light.ink }}
                >
                  Surface
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>

      <SaveThemeDialog open={saveOpen} onClose={() => setSaveOpen(false)} />

      <Dialog
        open={renaming !== null}
        title="Rename theme"
        onClose={() => setRenaming(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (renaming) {
                  dispatch({ type: 'theme/rename-custom', id: renaming.id, name: renaming.name });
                }
                setRenaming(null);
              }}
            >
              Save name
            </Button>
          </>
        }
      >
        <Field label="Theme name" htmlFor="rename-theme">
          <Input
            id="rename-theme"
            value={renaming?.name ?? ''}
            autoFocus
            maxLength={40}
            onChange={(event) =>
              setRenaming((current) => (current ? { ...current, name: event.target.value } : current))
            }
          />
        </Field>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this theme?"
        description="Workspaces using it fall back to Luma Calm. Your other themes are untouched."
        confirmLabel="Delete theme"
        onConfirm={() => {
          if (deleteId) dispatch({ type: 'theme/delete-custom', id: deleteId });
        }}
        onClose={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset theme settings?"
        description="Colour mode, background, typography, surface effects and motion return to the Luma defaults."
        confirmLabel="Reset theme"
        onConfirm={() => dispatch({ type: 'theme/reset' })}
        onClose={() => setResetOpen(false)}
      />
    </section>
  );
}
