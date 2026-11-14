import { useState, type FormEvent } from 'react';
import { useDashboard } from '../state/DashboardProvider';
import { createId } from '../lib/utils';
import { PencilIcon, PlusIcon, TaskIcon, TrashIcon } from '../components/icons';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Field';
import { WidgetCard } from './WidgetCard';

export function TasksWidget() {
  const { data, dispatch } = useDashboard();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingDue, setEditingDue] = useState('');
  const [dueDraft, setDueDraft] = useState('');

  const openCount = data.tasks.filter((task) => !task.done).length;
  const doneCount = data.tasks.length - openCount;

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    dispatch({
      type: 'task/add',
      task: {
        id: createId('task'),
        text,
        done: false,
        createdAt: Date.now(),
        dueAt: dueDraft || null,
        completedAt: null,
      },
    });
    setDraft('');
    setDueDraft('');
  };

  const startEditing = (id: string, text: string, dueAt: string | null) => {
    setEditingId(id);
    setEditingText(text);
    setEditingDue(dueAt ?? '');
  };

  const commitEditing = () => {
    if (!editingId) return;
    const text = editingText.trim();

    if (text) {
      dispatch({ type: 'task/update', id: editingId, text });
      dispatch({ type: 'task/due', id: editingId, dueAt: editingDue || null });
    } else {
      // Empty edit means the user cleared it — treat that as removing the task.
      dispatch({ type: 'task/delete', id: editingId });
    }

    setEditingId(null);
    setEditingText('');
    setEditingDue('');
  };

  return (
    <WidgetCard title="Tasks">
      <form className="task-composer" onSubmit={handleAdd}>
        <label className="visually-hidden" htmlFor="luma-task-input">
          New task
        </label>
        <Input
          id="luma-task-input"
          value={draft}
          maxLength={140}
          placeholder="Add a task…"
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
        />
        <Input
          className="task-date-input"
          type="date"
          value={dueDraft}
          aria-label="Due date for the new task"
          onChange={(event) => setDueDraft(event.target.value)}
        />
        <Button type="submit" variant="secondary" size="sm" icon={<PlusIcon size={15} />} disabled={!draft.trim()}>
          Add
        </Button>
      </form>

      {data.tasks.length === 0 ? (
        <EmptyState
          icon={<TaskIcon size={20} />}
          title="No tasks yet"
          text="Add something you want to get done today — it stays on this device."
        />
      ) : (
        <ul className="task-list">
          {data.tasks.map((task) => (
            <li key={task.id} className={`task${task.done ? ' task--done' : ''}`}>
              <input
                className="task__checkbox"
                type="checkbox"
                checked={task.done}
                aria-label={`Mark “${task.text}” as ${task.done ? 'not done' : 'done'}`}
                onChange={() => dispatch({ type: 'task/toggle', id: task.id })}
              />

              {editingId === task.id ? (
                <div className="task__edit">
                  <Input
                    value={editingText}
                    maxLength={140}
                    aria-label={`Edit “${task.text}”`}
                    autoFocus
                    onChange={(event) => setEditingText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitEditing();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        setEditingId(null);
                        setEditingText('');
                      }
                    }}
                  />
                  <Input
                    className="task-date-input"
                    type="date"
                    value={editingDue}
                    aria-label="Due date"
                    onChange={(event) => setEditingDue(event.target.value)}
                  />
                  <Button size="sm" variant="secondary" onClick={commitEditing}>
                    Save
                  </Button>
                </div>
              ) : (
                <span
                  className="task__text"
                  onClick={() => dispatch({ type: 'task/toggle', id: task.id })}
                >
                  {task.text}
                </span>
              )}

              <div className="task__actions">
                <IconButton
                  label={`Edit “${task.text}”`}
                  onClick={() => startEditing(task.id, task.text, task.dueAt)}
                >
                  <PencilIcon size={15} />
                </IconButton>
                <IconButton
                  label={`Delete “${task.text}”`}
                  danger
                  onClick={() => dispatch({ type: 'task/delete', id: task.id })}
                >
                  <TrashIcon size={15} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data.tasks.length > 0 ? (
        <div className="task-footer">
          <span>
            {openCount} open · {doneCount} done
          </span>
          {doneCount > 0 ? (
            <button
              type="button"
              className="task-footer__clear"
              onClick={() => dispatch({ type: 'task/clearCompleted' })}
            >
              Clear completed
            </button>
          ) : null}
        </div>
      ) : null}
    </WidgetCard>
  );
}
