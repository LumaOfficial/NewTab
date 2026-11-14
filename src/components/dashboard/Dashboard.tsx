import { Suspense, useState, type DragEvent, type FormEvent } from 'react';
import { useDashboard } from '../../state/DashboardProvider';
import { cx } from '../../lib/utils';
import { getWidget, WIDGET_SIZE_LABELS } from '../../widgets/catalogue';
import type { WidgetLayoutEntry } from '../../storage/schema';
import { WIDGET_COMPONENTS } from '../../widgets/registry';
import { WidgetBoundary } from '../../widgets/WidgetBoundary';
import { WidgetLoading } from '../../widgets/WidgetStates';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Dialog } from '../ui/Dialog';
import { EmptyState } from '../ui/EmptyState';
import { Field, Input } from '../ui/Field';
import { IconButton } from '../ui/IconButton';
import { Menu } from '../ui/Menu';
import {
  EyeOffIcon,
  GearIcon,
  GridIcon,
  GripIcon,
  LayoutIcon,
  LockIcon,
  PinIcon,
  PlusIcon,
  RestoreIcon,
  UnlockIcon,
} from '../icons';
import { LumaMark } from '../LumaMark';
import { AccountButton } from '../account/AccountButton';
import { SyncStatusChip } from '../account/SyncStatusChip';
import { BackgroundLayer } from './BackgroundLayer';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import type { AccountView } from '../../account/views';
import type { SettingsSectionId } from '../settings/sections';

export interface DashboardProps {
  openSettings: (section?: SettingsSectionId) => void;
  openAccount: (view?: AccountView) => void;
}

const DRAG_TYPE = 'text/luma-widget';

function WidgetSlot({
  entry,
  editing,
  locked,
  openSettings,
  openAccount,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  entry: WidgetLayoutEntry;
  editing: boolean;
  locked: boolean;
  openSettings: () => void;
  openAccount: (view?: AccountView) => void;
  onDragStart: (event: DragEvent<HTMLElement>, id: string) => void;
  onDragEnd: () => void;
  onDrop: (event: DragEvent<HTMLElement>, target: WidgetLayoutEntry) => void;
}) {
  const { dispatch, data } = useDashboard();
  const [dragOver, setDragOver] = useState(false);
  const descriptor = getWidget(entry.id);
  const Widget = WIDGET_COMPONENTS[entry.id];
  const isHidden = data.settings.hiddenWidgets.includes(entry.id);

  if (!descriptor || !Widget) return null;

  return (
    <article
      className={cx(
        'widget-slot',
        `widget-slot--${entry.size}`,
        editing && 'widget-slot--editing',
        entry.pinned && 'widget-slot--pinned',
        dragOver && 'widget-slot--drag-over',
        isHidden && 'widget-slot--hidden',
      )}
      data-widget-id={entry.id}
      onDragOver={(event) => {
        if (!editing || locked) return;
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        setDragOver(false);
        // Keep the drop on this slot; the grid's append handler must not also move it.
        event.stopPropagation();
        onDrop(event, entry);
      }}
    >
      {editing ? (
        <div className="widget-slot__controls">
          <button
            type="button"
            className="widget-slot__handle"
            draggable={!locked}
            aria-label={`Drag ${descriptor.title}`}
            title={locked ? 'Layout is locked' : `Drag ${descriptor.title}`}
            onDragStart={(event) => onDragStart(event, entry.id)}
            onDragEnd={() => {
              setDragOver(false);
              onDragEnd();
            }}
          >
            <GripIcon size={15} />
          </button>
          <span className="widget-slot__name">{descriptor.title}</span>
          {entry.pinned ? (
            <span className="widget-slot__pin" title="Pinned">
              <PinIcon size={13} />
            </span>
          ) : null}
          <Menu
            label={`${descriptor.title} layout options`}
            items={[
              ...descriptor.sizes.map((size) => ({
                id: `size-${size}`,
                label: `${WIDGET_SIZE_LABELS[size]}${entry.size === size ? ' · current' : ''}`,
                disabled: entry.size === size || locked,
                onSelect: () => dispatch({ type: 'layout/resize', id: entry.id, size }),
              })),
              {
                id: 'pin',
                label: entry.pinned ? 'Unpin widget' : 'Pin widget',
                icon: <PinIcon size={15} />,
                separatorBefore: true,
                onSelect: () => dispatch({ type: 'layout/pin', id: entry.id, pinned: !entry.pinned }),
              },
              {
                id: 'hide',
                label: 'Hide widget',
                icon: <EyeOffIcon size={15} />,
                disabled: locked,
                onSelect: () => dispatch({ type: 'widget/toggle', id: entry.id, visible: false }),
              },
            ]}
          />
        </div>
      ) : null}

      <WidgetBoundary widgetId={entry.id}>
        <Suspense fallback={<div className="card widget-card"><WidgetLoading /></div>}>
          <Widget
            widgetId={entry.id}
            openSettings={openSettings}
            openAccount={openAccount}
          />
        </Suspense>
      </WidgetBoundary>
    </article>
  );
}

function SaveLayoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useDashboard();
  const [name, setName] = useState('');
  const formId = 'save-layout-form';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: 'layout/save', name: name.trim() || 'My layout' });
    setName('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      title="Save this layout"
      description="Saved layouts stay in this browser and can be applied to any workspace."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            Save layout
          </Button>
        </>
      }
    >
      <form id={formId} className="form-stack" onSubmit={submit}>
        <Field label="Layout name" htmlFor="layout-name">
          <Input
            id="layout-name"
            value={name}
            autoFocus
            maxLength={40}
            placeholder="e.g. Deep work"
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
      </form>
    </Dialog>
  );
}

/**
 * The new-tab surface. Which widgets appear, their section, size and order come
 * entirely from the saved layout — nothing here hard-codes a widget.
 */
export function Dashboard({ openSettings, openAccount }: DashboardProps) {
  const { data, workspace, dispatch, savedLayouts } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const layout = data.settings.layout;
  const locked = layout.locked;
  const hidden = new Set(data.settings.hiddenWidgets);

  const visible = layout.entries.filter((entry) => !hidden.has(entry.id) && getWidget(entry.id));
  const sortPinned = (entries: WidgetLayoutEntry[]) =>
    [...entries].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  const heroIds = sortPinned(visible.filter((entry) => entry.section === 'hero'));
  const bodyIds = sortPinned(visible.filter((entry) => entry.section === 'body'));

  const startDrag = (event: DragEvent<HTMLElement>, id: string) => {
    event.dataTransfer.setData(DRAG_TYPE, id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const dropOn = (event: DragEvent<HTMLElement>, target: WidgetLayoutEntry) => {
    if (!editing || locked) return;
    event.preventDefault();
    const id = event.dataTransfer.getData(DRAG_TYPE) || draggingId;
    if (!id || id === target.id) return;

    const sectionEntries = layout.entries.filter((entry) => entry.section === target.section);
    const targetIndex = sectionEntries.findIndex((entry) => entry.id === target.id);
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;

    const draggedIndex = sectionEntries.findIndex((entry) => entry.id === id);
    let index = targetIndex + (after ? 1 : 0);
    if (draggedIndex !== -1 && draggedIndex < index) index -= 1;

    dispatch({ type: 'layout/move', id, section: target.section, index });
  };

  const appendTo = (section: WidgetLayoutEntry['section']) => (event: DragEvent<HTMLElement>) => {
    if (!editing || locked) return;
    event.preventDefault();
    const id = event.dataTransfer.getData(DRAG_TYPE) || draggingId;
    if (!id) return;
    const count = layout.entries.filter((entry) => entry.section === section).length;
    dispatch({ type: 'layout/move', id, section, index: count });
  };

  return (
    <div className="dashboard">
      <BackgroundLayer background={data.settings.background} />

      <header className="dashboard__top">
        <div className="dashboard__start">
          <div className="brand">
            <LumaMark size={26} />
            <span className="brand__word">
              Luma <span>New Tab</span>
            </span>
          </div>
          <WorkspaceSwitcher onManage={() => openSettings('workspaces')} />
        </div>
        <div className="dashboard__actions">
          <SyncStatusChip onOpen={() => openAccount('sync')} />
          <AccountButton onClick={() => openAccount('overview')} />
          <IconButton
            label={editing ? 'Finish customizing' : 'Customize layout'}
            solid={editing}
            onClick={() => setEditing((value) => !value)}
          >
            <LayoutIcon size={18} />
          </IconButton>
          <IconButton label="Open settings" solid onClick={() => openSettings()}>
            <GearIcon size={18} />
          </IconButton>
        </div>
      </header>

      {editing ? (
        <section className="layout-bar" aria-label="Layout editing">
          <div className="layout-bar__text">
            <strong>{locked ? 'Layout locked' : 'Customizing'}</strong>
            <span>
              {locked
                ? 'Unlock to move, resize or hide widgets.'
                : 'Drag the handle to move a widget. Use its menu to resize, pin or hide it.'}
            </span>
          </div>
          <div className="layout-bar__actions">
            <Button
              variant="ghost"
              size="sm"
              icon={locked ? <UnlockIcon size={15} /> : <LockIcon size={15} />}
              onClick={() => dispatch({ type: 'layout/toggle-lock' })}
            >
              {locked ? 'Unlock' : 'Lock'}
            </Button>
            <Button variant="ghost" size="sm" icon={<PlusIcon size={15} />} onClick={() => openSettings('widgets')}>
              Add widget
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSaveOpen(true)}>
              Save layout
            </Button>
            {workspace.history.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                icon={<RestoreIcon size={15} />}
                onClick={() => dispatch({ type: 'layout/restore-previous' })}
              >
                Restore previous
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
              Reset
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing(false)}>
              Done
            </Button>
          </div>
        </section>
      ) : null}

      {heroIds.length > 0 ? (
        <section
          className={cx('hero', heroIds.length === 1 && 'hero--single')}
          aria-label="Dashboard header widgets"
          onDragOver={(event) => {
            if (editing && !locked) event.preventDefault();
          }}
          onDrop={appendTo('hero')}
        >
          {heroIds.map((entry) => (
            <WidgetSlot
              key={entry.id}
              entry={entry}
              editing={editing}
              locked={locked}
              openSettings={() => openSettings('widgets')}
              openAccount={openAccount}
              onDragStart={startDrag}
              onDragEnd={() => setDraggingId(null)}
              onDrop={dropOn}
            />
          ))}
        </section>
      ) : null}

      <section
        className="dashboard-grid"
        aria-label="Dashboard widgets"
        onDragOver={(event) => {
          if (editing && !locked) event.preventDefault();
        }}
        onDrop={appendTo('body')}
      >
        {bodyIds.map((entry) => (
          <WidgetSlot
            key={entry.id}
            entry={entry}
            editing={editing}
            locked={locked}
            openSettings={() => openSettings('widgets')}
            openAccount={openAccount}
            onDragStart={startDrag}
            onDragEnd={() => setDraggingId(null)}
            onDrop={dropOn}
          />
        ))}

        {visible.length === 0 ? (
          <div className="widget-slot widget-slot--full">
            <div className="card widget-card">
              <EmptyState
                icon={<GridIcon size={20} />}
                title="Your dashboard is empty"
                text="Every widget is hidden right now. Add the ones you want from the widget library."
                action={
                  <Button variant="primary" onClick={() => openSettings('widgets')}>
                    Open widget library
                  </Button>
                }
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="dashboard__footer-links" aria-label="Layout shortcuts">
        <button type="button" className="text-button" onClick={() => openSettings('themes')}>
          Themes
        </button>
        <button type="button" className="text-button" onClick={() => openSettings('layouts')}>
          Layouts{savedLayouts.length > 0 ? ` (${savedLayouts.length})` : ''}
        </button>
        <button type="button" className="text-button" onClick={() => openSettings('workspaces')}>
          Workspaces
        </button>
        <button type="button" className="text-button" onClick={() => openSettings('accessibility')}>
          Accessibility
        </button>
      </section>

      <SaveLayoutDialog open={saveOpen} onClose={() => setSaveOpen(false)} />
      <ConfirmDialog
        open={resetOpen}
        title="Reset this layout?"
        description="Widgets return to the complete default layout. Your notes, tasks and shortcuts are kept."
        confirmLabel="Reset layout"
        onConfirm={() => dispatch({ type: 'layout/reset' })}
        onClose={() => setResetOpen(false)}
      />

      {/* Quick reordering for keyboard users, available only while editing. */}
      {editing ? (
        <div className="sr-only" aria-live="polite">
          Use the handle to drag widgets. Keyboard users can reorder from Settings → Layouts.
        </div>
      ) : null}

      <span className="sr-only">
        {bodyIds.length} widgets in {workspace.name}
      </span>
    </div>
  );
}
