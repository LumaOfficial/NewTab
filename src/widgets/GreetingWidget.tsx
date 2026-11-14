import { useDashboard } from '../state/DashboardProvider';
import { greetingForHour } from '../lib/format';
import { useNow } from '../lib/useNow';
import { WidgetCard } from './WidgetCard';
import type { WidgetProps } from './types';

export function GreetingWidget({ openSettings }: WidgetProps) {
  const { data } = useDashboard();
  const now = useNow(30000);
  const name = data.settings.displayName.trim();
  const openTasks = data.tasks.filter((task) => !task.done).length;

  return (
    <WidgetCard title="Greeting" hero>
      <div className="greeting">
        <p className="greeting__line">
          {greetingForHour(now.getHours())}
          {name ? `, ${name}` : ''}
        </p>
        <p className="greeting__meta">
          {name ? (
            openTasks > 0 ? (
              `${openTasks} ${openTasks === 1 ? 'task' : 'tasks'} left for today.`
            ) : (
              'Nothing left on your task list.'
            )
          ) : (
            <>
              Make it yours —{' '}
              <button type="button" className="greeting__link" onClick={openSettings}>
                add your name
              </button>
              .
            </>
          )}
        </p>
      </div>
    </WidgetCard>
  );
}
