import { formatDate, getClockParts, getTimeZoneLabel } from '../lib/time.js';
import { useNow } from '../hooks/useNow.js';
import { useDashboard } from '../state/DashboardProvider.jsx';
import { WidgetShell } from '../components/widgets/WidgetShell.jsx';

export function ClockWidget() {
  const { state } = useDashboard();
  const now = useNow(1000);
  const { hours, minutes, dayPeriod } = getClockParts(now, state.settings.clockFormat);

  return (
    <WidgetShell id="clock" title="Clock" meta={getTimeZoneLabel()}>
      <div className="clock">
        <p className="clock__time" aria-label={`The time is ${hours}:${minutes} ${dayPeriod}`.trim()}>
          <span>{hours}</span>
          <span className="clock__colon" aria-hidden="true">
            :
          </span>
          <span>{minutes}</span>
          {dayPeriod ? <span className="clock__period">{dayPeriod}</span> : null}
        </p>
        <p className="clock__date">{formatDate(now)}</p>
      </div>
    </WidgetShell>
  );
}
