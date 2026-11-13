import { Menu } from '../ui/Menu.jsx';
import { useDashboard } from '../../state/DashboardProvider.jsx';

/**
 * Shared card chrome for every dashboard widget: a small eyebrow title, an
 * optional count/meta label, per-widget actions, and a menu with the common
 * "hide" / "settings" options. Widgets only render their body.
 */
export function WidgetShell({ id, title, meta, actions, children }) {
  const { actions: dashboardActions } = useDashboard();

  return (
    <section className="card widget" data-widget={id} aria-labelledby={`widget-title-${id}`}>
      <header className="widget__head">
        <div className="widget__heading">
          <h2 className="widget__eyebrow" id={`widget-title-${id}`}>
            {title}
          </h2>
          {meta ? <span className="widget__meta">{meta}</span> : null}
        </div>
        <div className="widget__tools">
          {actions}
          <Menu
            label={`${title} options`}
            items={[
              { label: 'Widget settings', icon: 'grid', onSelect: () => dashboardActions.openSettings('widgets') },
              { label: 'Hide widget', icon: 'eyeOff', onSelect: () => dashboardActions.hideWidget(id) },
            ]}
          />
        </div>
      </header>
      <div className="widget__body">{children}</div>
    </section>
  );
}
