import { useState } from 'react';

import { useDashboard } from '../state/DashboardProvider.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { IconButton } from '../components/ui/Button.jsx';
import { WidgetShell } from '../components/widgets/WidgetShell.jsx';

export function TasksWidget() {
  const { state, actions } = useDashboard();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const tasks = state.tasks;
  const done = tasks.filter((task) => task.done).length;
  const meta = tasks.length ? `${done}/${tasks.length} done` : undefined;

  const submit = (event) => {
    event.preventDefault();
    const result = actions.addTask(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft('');
    setError('');
  };

  return (
    <WidgetShell id="tasks" title="Tasks" meta={meta}>
      <form className="task-add" onSubmit={submit}>
        <input
          className="task-add__input"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError('');
          }}
          placeholder="Add a task…"
          aria-label="Add a task"
          maxLength={300}
        />
        <IconButton icon="plus" label="Add task" type="submit" />
      </form>
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}

      {tasks.length === 0 ? (
        <div className="empty empty--compact">
          <span className="empty__badge" aria-hidden="true">
            <IconButton icon="task" label="Task" />
          </span>
          <p className="empty__title">Nothing on your list</p>
          <p className="empty__text">Add a task above to start today&rsquo;s list.</p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li className={`task ${task.done ? 'is-done' : ''}`.trim()} key={task.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={task.done}
                aria-label={`Mark "${task.text}" as ${task.done ? 'not done' : 'done'}`}
                className="task__check"
                onClick={() => actions.toggleTask(task.id)}
              >
                {task.done ? <Icon name="check" size={13} /> : null}
              </button>
              <span className="task__text">{task.text}</span>
              <IconButton className="task__remove" icon="trash" size={15} label={`Delete "${task.text}"`} onClick={() => actions.removeTask(task.id)} />
            </li>
          ))}
        </ul>
      )}

      {done > 0 ? (
        <div className="task-foot">
          <span>
            {done} of {tasks.length} done
          </span>
          <button type="button" className="link-button" onClick={() => actions.clearCompletedTasks()}>
            Clear completed
          </button>
        </div>
      ) : null}
    </WidgetShell>
  );
}
