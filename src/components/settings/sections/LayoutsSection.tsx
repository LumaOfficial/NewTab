import { useState } from 'react';
import { useDashboard } from '../../../state/DashboardProvider';
import { LAYOUT_PRESETS, type LayoutPresetId } from '../../../widgets/presets';
import { getWidget, WIDGET_SIZE_LABELS } from '../../../widgets/catalogue';
import type { WidgetLayoutEntry } from '../../../storage/schema';
import { cx } from '../../../lib/utils';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Dialog } from '../../ui/Dialog';
import { Field, Input, Select } from '../../ui/Field';
import { IconButton } from '../../ui/IconButton';
import { Switch } from '../../ui/Switch';
import { ArrowDownIcon, ArrowUpIcon, LockIcon, RestoreIcon, TrashIcon, UnlockIcon } from '../../icons';

function LayoutRow({ entry, index, total }: { entry: WidgetLayoutEntry; index: number; total: number }) {
  const { data, dispatch } = useDashboard();
  const descriptor = getWidget(entry.id);
  const hidden = data.settings.hiddenWidgets.includes(entry.id);
  if (!descriptor) return null;

  return (
    <li className={cx('widget-row', hidden && 'widget-row--hidden')}>
      <div className="widget-row__text">
        <span className="widget-row__title">
          {descriptor.title}
          {entry.pinned ? ' · pinned' : ''}
        </span>
        <span className="widget-row__description">
          {entry.section === 'hero' ? 'Header area' : 'Main grid'} · {entry.size}
        </span>
      </div>
      <Select
        className="select--compact"
        aria-label={`Section for ${descriptor.title}`}
        value={entry.section}
        onChange={(event) =>
          dispatch({
            type: 'layout/move',
            id: entry.id,
            section: event.target.value as 'hero' | 'body',
            index: 0,
          })
        }
      >
        <option value="hero">Header</option>
        <option value="body">Main grid</option>
      </Select>
      <Select
        className="select--compact"
        aria-label={`Size for ${descriptor.title}`}
        value={entry.size}
        disabled={data.settings.layout.locked}
        onChange={(event) =>
          dispatch({
            type: 'layout/resize',
            id: entry.id,
            size: event.target.value as WidgetLayoutEntry['size'],
          })
        }
      >
        {descriptor.sizes.map((size) => (
          <option key={size} value={size}>
            {WIDGET_SIZE_LABELS[size]}
          </option>
        ))}
      </Select>
      <IconButton
        label={`${entry.pinned ? 'Unpin' : 'Pin'} ${descriptor.title}`}
        onClick={() => dispatch({ type: 'layout/pin', id: entry.id, pinned: !entry.pinned })}
      >
        {entry.pinned ? '●' : '○'}
      </IconButton>
      <div className="widget-row__order">
        <IconButton
          label={`Move ${descriptor.title} up`}
          disabled={index === 0}
          onClick={() => dispatch({ type: 'widget/move', id: entry.id, direction: -1 })}
        >
          <ArrowUpIcon size={15} />
        </IconButton>
        <IconButton
          label={`Move ${descriptor.title} down`}
          disabled={index === total - 1}
          onClick={() => dispatch({ type: 'widget/move', id: entry.id, direction: 1 })}
        >
          <ArrowDownIcon size={15} />
        </IconButton>
      </div>
      <Switch
        checked={!hidden}
        label={`Show ${descriptor.title}`}
        onChange={(visible) =>
          dispatch({ type: 'widget/toggle', id: entry.id, visible })
        }
      />
    </li>
  );
}

export function LayoutsSection() {
  const { data, dispatch, savedLayouts, workspace } = useDashboard();
  const { layout } = data.settings;
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  return (
    <section className="settings__section" aria-labelledby="settings-layouts">
      <div>
        <h3 className="settings__section-title" id="settings-layouts">
          Layouts
        </h3>
        <p className="settings__section-intro">
          Presets are starting points — every one can be dragged, resized and saved as your own.
          Layouts belong to “{workspace.name}”.
        </p>
      </div>

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">Preset layouts</span>
          <Badge muted>{layout.mode === 'custom' ? 'Custom layout' : `Preset · ${layout.preset}`}</Badge>
        </div>
        <div className="preset-grid">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={cx(
                'preset-card',
                layout.mode === 'preset' && layout.preset === preset.id && 'preset-card--active',
              )}
              onClick={() => dispatch({ type: 'layout/apply-preset', preset: preset.id as LayoutPresetId })}
            >
              <span className="preset-card__label">{preset.label}</span>
              <span className="preset-card__description">{preset.description}</span>
              <span className="preset-card__count">
                {preset.placements.length} {preset.placements.length === 1 ? 'widget' : 'widgets'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">Saved layouts</span>
          <div className="button-row">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'layout/set-mode', mode: 'custom' })}
            >
              Custom mode
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={layout.locked ? <UnlockIcon size={15} /> : <LockIcon size={15} />}
              onClick={() => dispatch({ type: 'layout/toggle-lock' })}
            >
              {layout.locked ? 'Unlock layout' : 'Lock layout'}
            </Button>
          </div>
        </div>
        {savedLayouts.length === 0 ? (
          <p className="widget-hint">
            Save a layout from the dashboard’s customise toolbar, then reuse it any time.
          </p>
        ) : (
          <ul className="saved-list">
            {savedLayouts.map((saved) => (
              <li key={saved.id} className="saved-row">
                <div className="saved-row__text">
                  <span className="saved-row__name">{saved.name}</span>
                  <span className="saved-row__meta">
                    {saved.layout.entries.length} widgets ·{' '}
                    {new Date(saved.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="saved-row__actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'layout/apply-saved', id: saved.id })}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRenaming({ id: saved.id, name: saved.name })}
                  >
                    Rename
                  </Button>
                  <IconButton
                    label={`Duplicate ${saved.name}`}
                    onClick={() => dispatch({ type: 'layout/duplicate-saved', id: saved.id })}
                  >
                    +
                  </IconButton>
                  <IconButton
                    label={`Delete ${saved.name}`}
                    danger
                    onClick={() => setDeleteId(saved.id)}
                  >
                    <TrashIcon size={15} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="button-row">
          <Button
            variant="ghost"
            size="sm"
            icon={<RestoreIcon size={15} />}
            disabled={workspace.history.length === 0}
            onClick={() => dispatch({ type: 'layout/restore-previous' })}
          >
            Restore previous layout {workspace.history[0] ? `(${workspace.history[0].label})` : ''}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
            Reset layout
          </Button>
        </div>
      </div>

      <div className="settings__group">
        <span className="settings__group-title">Widget order & size</span>
        {layout.locked ? (
          <p className="widget-hint">The layout is locked. Unlock it to change sizes or order.</p>
        ) : null}
        <ul className="widget-order-list">
          {layout.entries.map((entry, index) => (
            <LayoutRow key={entry.id} entry={entry} index={index} total={layout.entries.length} />
          ))}
        </ul>
        <p className="widget-hint">
          Pinned widgets stay at the top of their section. Hiding a widget keeps its place in the
          layout so it can come back exactly where it was.
        </p>
      </div>

      <Dialog
        open={renaming !== null}
        title="Rename saved layout"
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
                  dispatch({ type: 'layout/rename-saved', id: renaming.id, name: renaming.name });
                }
                setRenaming(null);
              }}
            >
              Save name
            </Button>
          </>
        }
      >
        <Field label="Layout name" htmlFor="rename-layout">
          <Input
            id="rename-layout"
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
        title="Delete this saved layout?"
        description="The layout disappears from this list. The dashboard you are using stays as it is."
        confirmLabel="Delete layout"
        onConfirm={() => {
          if (deleteId) dispatch({ type: 'layout/delete-saved', id: deleteId });
        }}
        onClose={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset the layout?"
        description="The complete default layout returns. You can restore the previous arrangement afterwards from “Restore previous layout”."
        confirmLabel="Reset layout"
        onConfirm={() => dispatch({ type: 'layout/reset' })}
        onClose={() => setResetOpen(false)}
      />
    </section>
  );
}
