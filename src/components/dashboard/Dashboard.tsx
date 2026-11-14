import { useDashboard } from '../../state/DashboardProvider';
import { cx } from '../../lib/utils';
import { WIDGETS, type WidgetId } from '../../widgets/widgets';
import { WIDGET_COMPONENTS } from '../../widgets';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { IconButton } from '../ui/IconButton';
import { GearIcon, GridIcon } from '../icons';
import { LumaMark } from '../LumaMark';
import { AccountButton } from '../account/AccountButton';
import { SyncStatusChip } from '../account/SyncStatusChip';
import type { AccountView } from '../../account/views';

export interface DashboardProps {
  openSettings: () => void;
  openAccount: (view?: AccountView) => void;
}

function renderWidget(id: WidgetId, openSettings: () => void) {
  const Widget = WIDGET_COMPONENTS[id];
  return <Widget openSettings={openSettings} />;
}

/**
 * The new-tab surface. Which widgets appear, and in what order, comes entirely
 * from saved settings — the layout itself never hard-codes a widget.
 */
export function Dashboard({ openSettings, openAccount }: DashboardProps) {
  const { data } = useDashboard();
  const hidden = new Set(data.settings.hiddenWidgets);
  const visible = data.settings.widgetOrder.filter((id) => !hidden.has(id));

  const heroIds = visible.filter((id) => WIDGETS[id].placement === 'hero');
  const bodyIds = visible.filter((id) => WIDGETS[id].placement === 'body');

  return (
    <div className="dashboard">
      <header className="dashboard__top">
        <div className="brand">
          <LumaMark size={26} />
          <span className="brand__word">
            Luma <span>New Tab</span>
          </span>
        </div>
        <div className="dashboard__actions">
          <SyncStatusChip onOpen={() => openAccount('sync')} />
          <AccountButton onClick={() => openAccount('overview')} />
          <IconButton label="Open settings" solid onClick={openSettings}>
            <GearIcon size={18} />
          </IconButton>
        </div>
      </header>

      {heroIds.length > 0 ? (
        <section className={cx('hero', heroIds.length === 1 && 'hero--single')} aria-label="Time and greeting">
          {heroIds.map((id) => (
            <div key={id} className="widget">
              {renderWidget(id, openSettings)}
            </div>
          ))}
        </section>
      ) : null}

      <section className="widget-grid" aria-label="Dashboard widgets">
        {bodyIds.map((id, index) => (
          <div
            key={id}
            className={cx('widget', WIDGETS[id].span === 'full' && 'widget--full')}
            style={{ animationDelay: `${index * 45}ms` }}
          >
            {renderWidget(id, openSettings)}
          </div>
        ))}

        {visible.length === 0 ? (
          <div className="widget widget--full">
            <div className="card widget-card">
              <EmptyState
                icon={<GridIcon size={20} />}
                title="Your dashboard is empty"
                text="Every widget is hidden right now. Turn the ones you want back on in settings."
                action={
                  <Button variant="primary" onClick={openSettings}>
                    Open settings
                  </Button>
                }
              />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
