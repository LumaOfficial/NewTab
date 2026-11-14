import { useDashboard } from '../state/DashboardProvider';
import { formatClockTime, formatLongDate } from '../lib/format';
import { useNow } from '../lib/useNow';
import { WidgetCard } from './WidgetCard';

export function ClockWidget() {
  const { data } = useDashboard();
  const now = useNow(1000);

  return (
    <WidgetCard title="Clock" hero>
      <div className="clock">
        <p className="clock__time">
          <time dateTime={now.toISOString()}>{formatClockTime(now, data.settings.clockFormat)}</time>
        </p>
        <p className="clock__date">{formatLongDate(now)}</p>
      </div>
    </WidgetCard>
  );
}
