import { useDashboard } from '../../state/DashboardProvider.jsx';
import { Button } from '../ui/Button.jsx';
import { WIDGETS } from '../../widgets/registry.jsx';

/**
 * Renders the visible widgets in the user's order. The grid is CSS-driven, so
 * a widget's `span` decides its width and the order decides its position.
 */
export function WidgetGrid() {
  const { state, actions } = useDashboard();
  const hidden = new Set(state.layout.hidden);
  const visible = state.layout.order.filter((id) => WIDGETS[id] && !hidden.has(id));

  if (visible.length === 0) {
    return (
      <div className="empty empty--page">
        <p className="empty__title">Everything is hidden</p>
        <p className="empty__text">Turn a widget back on to see your dashboard.</p>
        <Button variant="primary" icon="grid" onClick={() => actions.openSettings('widgets')}>
          Manage widgets
        </Button>
      </div>
    );
  }

  return (
    <div className="widget-grid">
      {visible.map((id, index) => {
        const widget = WIDGETS[id];
        return (
          <div className={`widget-cell span-${widget.span}`} style={{ '--enter-delay': `${index * 55}ms` }} key={id}>
            <widget.Component />
          </div>
        );
      })}
    </div>
  );
}
