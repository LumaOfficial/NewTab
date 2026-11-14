import { useMemo, useState, type DragEvent } from 'react';
import { useDashboard } from '../../../state/DashboardProvider';
import {
  WIDGET_CATEGORIES,
  WIDGETS,
  type WidgetCategoryId,
  type WidgetDescriptor,
} from '../../../widgets/catalogue';
import { cx } from '../../../lib/utils';
import { ArrowDownIcon, ArrowUpIcon, GripIcon, LockIcon, PlusIcon, WifiIcon } from '../../icons';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Input, Select } from '../../ui/Field';
import { IconButton } from '../../ui/IconButton';
import { Switch } from '../../ui/Switch';
import { WidgetGlyph } from '../../../widgets/WidgetIcon';

function WidgetSettingsForm({ descriptor }: { descriptor: WidgetDescriptor }) {
  const { data, dispatch } = useDashboard();
  const values = {
    ...(descriptor.defaults ?? {}),
    ...(data.settings.widgetSettings[descriptor.id] ?? {}),
  };

  if (!descriptor.settings || descriptor.settings.length === 0) {
    return <p className="widget-hint">This widget has no settings yet.</p>;
  }

  const reset = () => {
    const widgetSettings = {
      ...data.settings.widgetSettings,
      [descriptor.id]: { ...(descriptor.defaults ?? {}) },
    };
    dispatch({ type: 'settings/patch', patch: { widgetSettings } });
  };

  return (
    <div className="widget-settings">
      {descriptor.settings.map((field) => {
        const id = `widget-${descriptor.id}-${field.key}`;
        const value = values[field.key];
        return (
          <div key={field.key} className="widget-settings__field">
            <label className="field__label" htmlFor={id}>
              {field.label}
            </label>
            {field.type === 'toggle' ? (
              <Switch
                checked={Boolean(value)}
                label={field.label}
                onChange={(next) =>
                  dispatch({ type: 'widget/settings', id: descriptor.id, patch: { [field.key]: next } })
                }
              />
            ) : field.type === 'select' ? (
              <Select
                id={id}
                value={String(value ?? '')}
                onChange={(event) =>
                  dispatch({
                    type: 'widget/settings',
                    id: descriptor.id,
                    patch: { [field.key]: event.target.value },
                  })
                }
              >
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : field.type === 'number' ? (
              <Input
                id={id}
                type="number"
                min={field.min}
                max={field.max}
                value={Number(value ?? 0)}
                onChange={(event) =>
                  dispatch({
                    type: 'widget/settings',
                    id: descriptor.id,
                    patch: { [field.key]: Number(event.target.value) },
                  })
                }
              />
            ) : (
              <Input
                id={id}
                value={String(value ?? '')}
                placeholder={field.placeholder}
                onChange={(event) =>
                  dispatch({
                    type: 'widget/settings',
                    id: descriptor.id,
                    patch: { [field.key]: event.target.value },
                  })
                }
              />
            )}
            {field.hint ? <p className="field__hint">{field.hint}</p> : null}
          </div>
        );
      })}
      <Button variant="ghost" size="sm" onClick={reset}>
        Reset this widget’s settings
      </Button>
    </div>
  );
}

export function WidgetsSection() {
  const { data, dispatch } = useDashboard();
  const { layout, widgetOrder, hiddenWidgets } = data.settings;
  const hidden = new Set(hiddenWidgets);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<WidgetCategoryId | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const inLayout = new Set(layout.entries.map((entry) => entry.id));
  const visibleCount = layout.entries.filter((entry) => !hidden.has(entry.id)).length;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return WIDGETS.filter((widget) => {
      if (category !== 'all' && widget.category !== category) return false;
      if (!term) return true;
      return (
        widget.title.toLowerCase().includes(term) ||
        widget.description.toLowerCase().includes(term) ||
        (widget.keywords ?? []).some((keyword) => keyword.includes(term))
      );
    });
  }, [category, query]);

  const grouped = WIDGET_CATEGORIES.map((group) => ({
    group,
    widgets: filtered.filter((widget) => widget.category === group.id),
  })).filter((entry) => entry.widgets.length > 0);

  const orderEntries = layout.entries;

  const dropOn = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault();
    const id = dragId ?? event.dataTransfer.getData('text/luma-widget');
    if (!id || id === targetId) return;
    const target = layout.entries.find((entry) => entry.id === targetId);
    if (!target) return;
    const index = layout.entries
      .filter((entry) => entry.section === target.section)
      .findIndex((entry) => entry.id === targetId);
    dispatch({ type: 'layout/move', id, section: target.section, index });
    setDragId(null);
  };

  return (
    <section className="settings__section" aria-labelledby="settings-widgets">
      <div>
        <h3 className="settings__section-title" id="settings-widgets">
          Widget library
        </h3>
        <p className="settings__section-intro">
          {WIDGETS.length} widgets across {WIDGET_CATEGORIES.length} categories · {visibleCount}{' '}
          visible on this workspace’s dashboard. Widgets that need a service say so instead of
          showing placeholder data.
        </p>
      </div>

      <div className="widget-toolbar">
        <Input
          type="search"
          value={query}
          placeholder="Search widgets…"
          aria-label="Search widgets"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="chip-row" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={cx('chip', category === 'all' && 'chip--active')}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          {WIDGET_CATEGORIES.map((group) => (
            <button
              key={group.id}
              type="button"
              className={cx('chip', category === group.id && 'chip--active')}
              onClick={() => setCategory(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">On this dashboard</span>
          <span className="widget-hint">Drag to reorder · {layout.mode === 'custom' ? 'Custom layout' : 'Preset layout'}</span>
        </div>
        {orderEntries.length === 0 ? (
          <p className="widget-hint">No widgets placed yet. Add one below.</p>
        ) : (
          <ul className="widget-order-list">
            {orderEntries.map((entry, index) => {
              const descriptor = WIDGETS.find((widget) => widget.id === entry.id);
              if (!descriptor) return null;
              const isHidden = hidden.has(entry.id);
              return (
                <li
                  key={entry.id}
                  className={cx('widget-row', isHidden && 'widget-row--hidden')}
                  draggable
                  onDragStart={(event) => {
                    setDragId(entry.id);
                    event.dataTransfer.setData('text/luma-widget', entry.id);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => dropOn(event, entry.id)}
                >
                  <span className="widget-row__handle" aria-hidden="true">
                    <GripIcon size={14} />
                  </span>
                  <WidgetGlyph name={descriptor.icon} size={17} />
                  <div className="widget-row__text">
                    <span className="widget-row__title">
                      {descriptor.title}
                      {entry.pinned ? ' · pinned' : ''}
                    </span>
                    <span className="widget-row__description">
                      {entry.size} · {entry.section === 'hero' ? 'header area' : 'main grid'}
                    </span>
                  </div>
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
                      disabled={index === orderEntries.length - 1}
                      onClick={() => dispatch({ type: 'widget/move', id: entry.id, direction: 1 })}
                    >
                      <ArrowDownIcon size={15} />
                    </IconButton>
                  </div>
                  <Switch
                    checked={!isHidden}
                    label={`Show ${descriptor.title}`}
                    onChange={(visible) => dispatch({ type: 'widget/toggle', id: entry.id, visible })}
                  />
                </li>
              );
            })}
          </ul>
        )}
        <p className="widget-hint">
          Widget order is shared with the layout editor and can be locked there. Reordering here
          never removes a widget from the library.
        </p>
      </div>

      {grouped.map(({ group, widgets }) => (
        <div key={group.id} className="settings__group">
          <div className="settings__title-row">
            <span className="settings__group-title">{group.label}</span>
            <span className="widget-hint">{group.description}</span>
          </div>
          <ul className="widget-library">
            {widgets.map((widget) => {
              const isVisible = inLayout.has(widget.id) && !hidden.has(widget.id);
              const isOpen = expanded === widget.id;
              return (
                <li key={widget.id} className="widget-library__item">
                  <div className="widget-row">
                    <WidgetGlyph name={widget.icon} size={17} />
                    <div className="widget-row__text">
                      <span className="widget-row__title">{widget.title}</span>
                      <span className="widget-row__description">{widget.description}</span>
                      <span className="widget-badges">
                        {widget.permission ? <Badge muted>Needs permission</Badge> : null}
                        {!widget.worksOffline ? (
                          <Badge muted>
                            <WifiIcon size={11} /> Needs connection
                          </Badge>
                        ) : (
                          <Badge muted>Works offline</Badge>
                        )}
                        {widget.integration ? <Badge muted>Integration</Badge> : null}
                        {widget.settings ? <Badge muted>Configurable</Badge> : null}
                      </span>
                    </div>
                    <div className="widget-row__order">
                      {widget.settings ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpanded(isOpen ? null : widget.id)}
                        >
                          {isOpen ? 'Hide settings' : 'Settings'}
                        </Button>
                      ) : null}
                      {isVisible ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            dispatch({ type: 'widget/toggle', id: widget.id, visible: false })
                          }
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<PlusIcon size={14} />}
                          onClick={() =>
                            dispatch({ type: 'widget/toggle', id: widget.id, visible: true })
                          }
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                  {isOpen ? <WidgetSettingsForm descriptor={widget} /> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {filtered.length === 0 ? (
        <p className="widget-hint">No widget matches that search.</p>
      ) : null}

      <div className="settings__group">
        <div className="settings__title-row">
          <span className="settings__group-title">Layout lock</span>
          <Button
            variant="ghost"
            size="sm"
            icon={layout.locked ? <LockIcon size={15} /> : undefined}
            onClick={() => dispatch({ type: 'layout/toggle-lock' })}
          >
            {layout.locked ? 'Unlock layout' : 'Lock layout'}
          </Button>
        </div>
        <p className="widget-hint">
          Locking stops drag, resize and hide actions on the dashboard. Widgets stay fully usable.
        </p>
      </div>

      {/* Keeps the offline badge icon meaningful for screen readers. */}
      <p className="sr-only">
        Current order: {widgetOrder.length} widgets known, {visibleCount} visible.
      </p>
    </section>
  );
}
