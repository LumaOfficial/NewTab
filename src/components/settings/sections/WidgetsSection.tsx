import { useDashboard } from '../../../state/DashboardProvider';
import { WIDGET_IDS, WIDGETS } from '../../../widgets/widgets';
import { cx } from '../../../lib/utils';
import { ArrowDownIcon, ArrowUpIcon } from '../../icons';
import { IconButton } from '../../ui/IconButton';
import { Switch } from '../../ui/Switch';

export function WidgetsSection() {
  const { data, dispatch } = useDashboard();
  const { widgetOrder, hiddenWidgets } = data.settings;
  const hidden = new Set(hiddenWidgets);

  return (
    <section className="settings__section" aria-labelledby="settings-widgets">
      <div>
        <h3 className="settings__section-title" id="settings-widgets">
          Dashboard widgets
        </h3>
        <p className="settings__section-intro">
          Show or hide widgets and change their order on the new tab.
        </p>
      </div>

      <div className="shortcut-rows">
        {widgetOrder.map((id, index) => {
          const meta = WIDGETS[id];
          const isVisible = !hidden.has(id);

          return (
            <div key={id} className={cx('widget-row', !isVisible && 'widget-row--hidden')}>
              <div className="widget-row__text">
                <span className="widget-row__title">{meta.title}</span>
                <span className="widget-row__description">{meta.description}</span>
              </div>

              <div className="widget-row__order">
                <IconButton
                  label={`Move ${meta.title} up`}
                  disabled={index === 0}
                  onClick={() => dispatch({ type: 'widget/move', id, direction: -1 })}
                >
                  <ArrowUpIcon size={15} />
                </IconButton>
                <IconButton
                  label={`Move ${meta.title} down`}
                  disabled={index === WIDGET_IDS.length - 1}
                  onClick={() => dispatch({ type: 'widget/move', id, direction: 1 })}
                >
                  <ArrowDownIcon size={15} />
                </IconButton>
              </div>

              <Switch
                checked={isVisible}
                label={`Show ${meta.title}`}
                onChange={(visible) => dispatch({ type: 'widget/toggle', id, visible })}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
