import { useDashboard } from '../../state/DashboardProvider.jsx';
import { WIDGETS } from '../../widgets/registry.jsx';
import { IconButton } from '../ui/Button.jsx';
import { Switch } from '../ui/Switch.jsx';

export function WidgetsSection() {
  const { state, actions } = useDashboard();
  const hidden = new Set(state.layout.hidden);
  const order = state.layout.order;

  return (
    <section className="section">
      <header className="section__head">
        <h3>Dashboard widgets</h3>
        <p>Show, hide and reorder the cards on your dashboard. Hidden widgets keep their data.</p>
      </header>

      <div className="section__card section__card--tight">
        {order.map((id, index) => {
          const widget = WIDGETS[id];
          if (!widget) return null;
          const isHidden = hidden.has(id);

          return (
            <div className="row row--divide" key={id}>
              <div className="row__text">
                <h4>
                  {widget.title}
                  {isHidden ? <span className="pill pill--muted">Hidden</span> : null}
                </h4>
                <p>{widget.description}</p>
              </div>
              <div className="row__actions">
                <IconButton
                  icon="arrowUp"
                  label={`Move ${widget.title} up`}
                  disabled={index === 0}
                  onClick={() => actions.moveWidget(id, -1)}
                />
                <IconButton
                  icon="arrowDown"
                  label={`Move ${widget.title} down`}
                  disabled={index === order.length - 1}
                  onClick={() => actions.moveWidget(id, 1)}
                />
                <Switch label={`Show ${widget.title}`} checked={!isHidden} onChange={(next) => actions.setWidgetVisible(id, next)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
