import { getGreeting } from '../lib/time.js';
import { useNow } from '../hooks/useNow.js';
import { useDashboard } from '../state/DashboardProvider.jsx';
import { WidgetShell } from '../components/widgets/WidgetShell.jsx';

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export function GreetingWidget() {
  const { state } = useDashboard();
  const now = useNow(60_000);
  const name = state.settings.displayName.trim();
  const greeting = getGreeting(now);

  const openTasks = state.tasks.filter((task) => !task.done).length;
  let hint = 'Your day is a blank page — add a task or a note.';
  if (openTasks > 0) hint = `${plural(openTasks, 'task')} left on your list.`;
  else if (state.notes.length > 0) hint = `${plural(state.notes.length, 'note')} saved on this device.`;

  return (
    <WidgetShell id="greeting" title="Greeting">
      <div className="greeting">
        <h3 className="greeting__line">
          {greeting}
          {name ? (
            <>
              , <span className="greeting__name">{name}</span>
            </>
          ) : null}
        </h3>
        <p className="greeting__hint">{hint}</p>
      </div>
    </WidgetShell>
  );
}
