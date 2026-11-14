import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useDashboard } from '../../state/DashboardProvider';
import { createId } from '../../lib/utils';
import { isoDay, lastNDays, minutesToClock, shortWeekday, todayIso } from '../../lib/dates';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Field';
import { IconButton } from '../../components/ui/IconButton';
import { WidgetCard } from '../WidgetCard';
import {
  FlameIcon,
  NoteIcon,
  PinIcon,
  SparkIcon,
  TaskIcon,
  TimerIcon,
  TrashIcon,
} from '../../components/icons';
import { NoteDialog } from '../../components/editors/NoteDialog';
import { useNow, useWidgetState } from '../hooks';
import type { Note } from '../../storage/schema';

/* ------------------------------------------------------------------ Subtasks */

interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

interface SubtaskState extends Record<string, unknown> {
  items: Record<string, Subtask[]>;
}

function isSubtaskState(value: SubtaskState): boolean {
  return typeof value.items === 'object' && value.items !== null;
}

export function SubtasksWidget() {
  const { data } = useDashboard();
  const [state, setState] = useWidgetState<SubtaskState>('subtasks', { items: {} });
  const items = isSubtaskState(state) ? state.items : {};
  const [taskId, setTaskId] = useState(data.tasks[0]?.id ?? '');
  const [draft, setDraft] = useState('');

  const activeTask = data.tasks.find((task) => task.id === taskId) ?? data.tasks[0];
  const list = activeTask ? items[activeTask.id] ?? [] : [];

  const update = (next: Subtask[]) => {
    if (!activeTask) return;
    setState({ items: { ...items, [activeTask.id]: next } });
  };

  if (data.tasks.length === 0) {
    return (
      <WidgetCard title="Subtasks">
        <EmptyState
          icon={<TaskIcon size={20} />}
          title="No parent tasks yet"
          text="Add a task first, then break it into smaller steps here."
        />
      </WidgetCard>
    );
  }

  const addSubtask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeTask) return;
    update([...list, { id: createId('sub'), text, done: false }]);
    setDraft('');
  };

  return (
    <WidgetCard title="Subtasks">
      <select
        className="select select--compact"
        aria-label="Parent task"
        value={activeTask?.id ?? ''}
        onChange={(event) => setTaskId(event.target.value)}
      >
        {data.tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.text}
          </option>
        ))}
      </select>

      {list.length === 0 ? (
        <p className="widget-hint">No steps yet for “{activeTask?.text}”.</p>
      ) : (
        <ul className="check-list">
          {list.map((subtask) => (
            <li key={subtask.id} className={subtask.done ? 'check-row check-row--done' : 'check-row'}>
              <input
                type="checkbox"
                checked={subtask.done}
                aria-label={`Mark “${subtask.text}” ${subtask.done ? 'not done' : 'done'}`}
                onChange={() =>
                  update(
                    list.map((entry) =>
                      entry.id === subtask.id ? { ...entry, done: !entry.done } : entry,
                    ),
                  )
                }
              />
              <span>{subtask.text}</span>
              <IconButton
                label={`Remove “${subtask.text}”`}
                danger
                onClick={() => update(list.filter((entry) => entry.id !== subtask.id))}
              >
                <TrashIcon size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <form className="inline-form" onSubmit={addSubtask}>
        <Input
          value={draft}
          maxLength={120}
          placeholder="Add a step…"
          aria-label="New subtask"
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!draft.trim()}>
          Add
        </Button>
      </form>
    </WidgetCard>
  );
}

/* ---------------------------------------------------------------- Pinned notes */

export function PinnedNotesWidget() {
  const { data, dispatch } = useDashboard();
  const [editing, setEditing] = useState<Note | null>(null);
  const pinned = data.notes.filter((note) => note.pinned).slice(0, 4);

  return (
    <WidgetCard title="Pinned notes">
      {pinned.length === 0 ? (
        <EmptyState
          icon={<PinIcon size={20} />}
          title="Nothing pinned"
          text="Pin a note from the Notes widget to keep it in view."
        />
      ) : (
        <ul className="note-list">
          {pinned.map((note) => (
            <li key={note.id} className="note-row">
              <button type="button" className="note" onClick={() => setEditing(note)}>
                <span className="note__title">{note.title || 'Untitled note'}</span>
                {note.body.trim() ? <span className="note__excerpt">{note.body}</span> : null}
              </button>
              <IconButton
                label={`Unpin ${note.title || 'note'}`}
                onClick={() => dispatch({ type: 'note/pin', id: note.id, pinned: false })}
              >
                <PinIcon size={15} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <NoteDialog open={editing !== null} note={editing} onClose={() => setEditing(null)} />
    </WidgetCard>
  );
}

/* ------------------------------------------------------------------ Focus timer */

interface FocusState extends Record<string, unknown> {
  durationMs: number;
  endsAt: number | null;
  remainingMs: number;
  running: boolean;
}

export function FocusTimerWidget() {
  const [state, setState] = useWidgetState<FocusState>('focus-timer', {
    durationMs: 25 * 60_000,
    endsAt: null,
    remainingMs: 25 * 60_000,
    running: false,
  });
  const now = useNow(1000);

  const remaining = state.running && state.endsAt ? Math.max(0, state.endsAt - now.getTime()) : state.remainingMs;
  const finished = state.running && state.endsAt !== null && remaining === 0;

  useEffect(() => {
    if (finished) {
      setState({ ...state, running: false, endsAt: null, remainingMs: 0 });
    }
  }, [finished, setState, state]);

  const start = (durationMs = state.durationMs) =>
    setState({ durationMs, running: true, endsAt: Date.now() + durationMs, remainingMs: durationMs });

  const pause = () =>
    setState({
      ...state,
      running: false,
      endsAt: null,
      remainingMs: state.endsAt ? Math.max(0, state.endsAt - Date.now()) : state.remainingMs,
    });

  return (
    <WidgetCard
      title="Focus timer"
      actions={
        <IconButton label="Reset timer" onClick={() => setState({ ...state, running: false, endsAt: null, remainingMs: state.durationMs })}>
          <TimerIcon size={16} />
        </IconButton>
      }
    >
      <div className="timer">
        <span className="timer__value">{minutesToClock(remaining)}</span>
        <span className="timer__meta">
          {finished ? 'Session complete' : state.running ? 'In focus' : 'Ready'}
        </span>
      </div>
      <div className="chip-row">
        {[15, 25, 45].map((minutes) => (
          <button
            key={minutes}
            type="button"
            className="chip"
            onClick={() => start(minutes * 60_000)}
          >
            {minutes} min
          </button>
        ))}
      </div>
      <div className="button-row">
        {state.running ? (
          <Button variant="secondary" size="sm" onClick={pause}>
            Pause
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={() => start()}>
            {state.remainingMs === state.durationMs ? 'Start' : 'Resume'}
          </Button>
        )}
      </div>
    </WidgetCard>
  );
}

/* -------------------------------------------------------------------- Pomodoro */

type PomodoroPhase = 'focus' | 'short' | 'long';

const POMODORO_LENGTHS: Record<PomodoroPhase, number> = {
  focus: 25 * 60_000,
  short: 5 * 60_000,
  long: 15 * 60_000,
};

interface PomodoroState extends Record<string, unknown> {
  phase: PomodoroPhase;
  endsAt: number | null;
  remainingMs: number;
  running: boolean;
  sessions: number;
}

export function PomodoroWidget() {
  const [state, setState] = useWidgetState<PomodoroState>('pomodoro', {
    phase: 'focus',
    endsAt: null,
    remainingMs: POMODORO_LENGTHS.focus,
    running: false,
    sessions: 0,
  });
  const now = useNow(1000);
  const remaining = state.running && state.endsAt ? Math.max(0, state.endsAt - now.getTime()) : state.remainingMs;
  const finished = state.running && state.endsAt !== null && remaining === 0;

  useEffect(() => {
    if (!finished) return;
    const nextPhase: PomodoroPhase = state.phase === 'focus' ? 'short' : 'focus';
    const sessions = state.phase === 'focus' ? state.sessions + 1 : state.sessions;
    setState({
      phase: nextPhase,
      endsAt: null,
      remainingMs: POMODORO_LENGTHS[nextPhase],
      running: false,
      sessions,
    });
  }, [finished, setState, state]);

  const label = state.phase === 'focus' ? 'Focus' : state.phase === 'short' ? 'Short break' : 'Long break';

  return (
    <WidgetCard title="Pomodoro">
      <div className="timer">
        <span className="timer__value">{minutesToClock(remaining)}</span>
        <span className="timer__meta">
          {label} · {state.sessions} {state.sessions === 1 ? 'session' : 'sessions'}
        </span>
      </div>
      <div className="chip-row">
        {(['focus', 'short', 'long'] as PomodoroPhase[]).map((phase) => (
          <button
            key={phase}
            type="button"
            className={`chip${state.phase === phase ? ' chip--active' : ''}`}
            onClick={() =>
              setState({
                ...state,
                phase,
                running: false,
                endsAt: null,
                remainingMs: POMODORO_LENGTHS[phase],
              })
            }
          >
            {phase === 'focus' ? '25' : phase === 'short' ? '5' : '15'} min
          </button>
        ))}
      </div>
      <div className="button-row">
        {state.running ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setState({
                ...state,
                running: false,
                endsAt: null,
                remainingMs: state.endsAt ? Math.max(0, state.endsAt - Date.now()) : state.remainingMs,
              })
            }
          >
            Pause
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              setState({
                ...state,
                running: true,
                endsAt: Date.now() + state.remainingMs,
              })
            }
          >
            Start
          </Button>
        )}
      </div>
    </WidgetCard>
  );
}

/* ---------------------------------------------------------------------- Habits */

interface Habit {
  id: string;
  name: string;
  days: string[];
}

interface HabitState extends Record<string, unknown> {
  habits: Habit[];
}

function readHabits(value: HabitState): Habit[] {
  if (!Array.isArray(value.habits)) return [];
  return value.habits.filter(
    (habit): habit is Habit =>
      typeof habit === 'object' &&
      habit !== null &&
      typeof (habit as Habit).id === 'string' &&
      typeof (habit as Habit).name === 'string' &&
      Array.isArray((habit as Habit).days),
  );
}

function streak(days: string[]): number {
  const set = new Set(days);
  let count = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    if (set.has(isoDay(date))) count += 1;
    else if (offset > 0) break;
  }
  return count;
}

export function HabitsWidget() {
  const [state, setState] = useWidgetState<HabitState>('habits', { habits: [] });
  const habits = readHabits(state);
  const today = todayIso();
  const [draft, setDraft] = useState('');

  const setHabits = (next: Habit[]) => setState({ habits: next });

  const addHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.trim();
    if (!name) return;
    setHabits([...habits, { id: createId('habit'), name, days: [] }]);
    setDraft('');
  };

  return (
    <WidgetCard title="Habits">
      {habits.length === 0 ? (
        <EmptyState
          icon={<FlameIcon size={20} />}
          title="Build a daily habit"
          text="Add one small thing you want to do every day."
        />
      ) : (
        <ul className="check-list">
          {habits.map((habit) => {
            const done = habit.days.includes(today);
            return (
              <li key={habit.id} className={done ? 'check-row check-row--done' : 'check-row'}>
                <input
                  type="checkbox"
                  checked={done}
                  aria-label={`Mark “${habit.name}” ${done ? 'not done' : 'done'} today`}
                  onChange={() =>
                    setHabits(
                      habits.map((entry) =>
                        entry.id === habit.id
                          ? {
                              ...entry,
                              days: done
                                ? entry.days.filter((day) => day !== today)
                                : [...entry.days, today],
                            }
                          : entry,
                      ),
                    )
                  }
                />
                <span className="check-row__label">{habit.name}</span>
                <span className="check-row__meta">{streak(habit.days)}d</span>
                <IconButton
                  label={`Delete habit “${habit.name}”`}
                  danger
                  onClick={() => setHabits(habits.filter((entry) => entry.id !== habit.id))}
                >
                  <TrashIcon size={14} />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
      <form className="inline-form" onSubmit={addHabit}>
        <Input
          value={draft}
          maxLength={60}
          placeholder="Add a habit…"
          aria-label="New habit"
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!draft.trim()}>
          Add
        </Button>
      </form>
    </WidgetCard>
  );
}

/* ------------------------------------------------------------------ Daily goals */

interface Goal {
  id: string;
  text: string;
  done: boolean;
}

interface GoalState extends Record<string, unknown> {
  date: string;
  goals: Goal[];
}

export function DailyGoalsWidget() {
  const [state, setState] = useWidgetState<GoalState>('daily-goals', {
    date: todayIso(),
    goals: [],
  });
  const today = todayIso();
  const goals = state.date === today && Array.isArray(state.goals) ? state.goals : [];
  const [draft, setDraft] = useState('');
  const doneCount = goals.filter((goal) => goal.done).length;
  const percent = goals.length === 0 ? 0 : Math.round((doneCount / goals.length) * 100);

  const setGoals = (next: Goal[]) => setState({ date: today, goals: next });

  const addGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setGoals([...goals, { id: createId('goal'), text, done: false }]);
    setDraft('');
  };

  return (
    <WidgetCard title="Daily goals">
      <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Daily goal progress">
        <span className="progress__bar" style={{ width: `${percent}%` }} />
      </div>
      <p className="widget-hint">
        {goals.length === 0 ? 'Add up to a few goals for today.' : `${doneCount} of ${goals.length} done today`}
      </p>
      <ul className="check-list">
        {goals.map((goal) => (
          <li key={goal.id} className={goal.done ? 'check-row check-row--done' : 'check-row'}>
            <input
              type="checkbox"
              checked={goal.done}
              aria-label={`Mark “${goal.text}” ${goal.done ? 'not done' : 'done'}`}
              onChange={() =>
                setGoals(goals.map((entry) => (entry.id === goal.id ? { ...entry, done: !entry.done } : entry)))
              }
            />
            <span className="check-row__label">{goal.text}</span>
          </li>
        ))}
      </ul>
      <form className="inline-form" onSubmit={addGoal}>
        <Input
          value={draft}
          maxLength={80}
          placeholder="Add a goal for today…"
          aria-label="New daily goal"
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!draft.trim()}>
          Add
        </Button>
      </form>
    </WidgetCard>
  );
}

/* ------------------------------------------------------------------- Reminders */

interface Reminder {
  id: string;
  text: string;
  time: string;
  done: boolean;
}

interface ReminderState extends Record<string, unknown> {
  items: Reminder[];
}

export function RemindersWidget() {
  const [state, setState] = useWidgetState<ReminderState>('reminders', { items: [] });
  const items = Array.isArray(state.items) ? state.items : [];
  const [draft, setDraft] = useState('');
  const [time, setTime] = useState('');

  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setState({ items: [...items, { id: createId('reminder'), text, time: time || '—', done: false }] });
    setDraft('');
    setTime('');
  };

  return (
    <WidgetCard title="Reminders">
      {sorted.length === 0 ? (
        <p className="widget-hint">Nothing planned. Reminders stay on this device.</p>
      ) : (
        <ul className="check-list">
          {sorted.map((item) => (
            <li key={item.id} className={item.done ? 'check-row check-row--done' : 'check-row'}>
              <input
                type="checkbox"
                checked={item.done}
                aria-label={`Mark “${item.text}” ${item.done ? 'not done' : 'done'}`}
                onChange={() =>
                  setState({
                    items: items.map((entry) =>
                      entry.id === item.id ? { ...entry, done: !entry.done } : entry,
                    ),
                  })
                }
              />
              <span className="check-row__label">{item.text}</span>
              <span className="check-row__meta">{item.time}</span>
              <IconButton
                label={`Delete reminder “${item.text}”`}
                danger
                onClick={() => setState({ items: items.filter((entry) => entry.id !== item.id) })}
              >
                <TrashIcon size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <form className="inline-form" onSubmit={add}>
        <Input
          value={draft}
          maxLength={100}
          placeholder="Remind me to…"
          aria-label="New reminder"
          onChange={(event) => setDraft(event.target.value)}
        />
        <Input
          className="input--time"
          type="time"
          value={time}
          aria-label="Reminder time"
          onChange={(event) => setTime(event.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!draft.trim()}>
          Add
        </Button>
      </form>
    </WidgetCard>
  );
}

/* ---------------------------------------------------------------- Daily briefing */

export function DailyBriefingWidget() {
  const { data } = useDashboard();
  const [habits] = useWidgetState<HabitState>('habits', { habits: [] });
  const today = todayIso();
  const openTasks = data.tasks.filter((task) => !task.done);
  const dueToday = openTasks.filter((task) => task.dueAt === today);
  const eventsToday = data.events.filter((event) => event.date === today);
  const habitList = readHabits(habits);
  const habitsDone = habitList.filter((habit) => habit.days.includes(today)).length;

  return (
    <WidgetCard title="Daily briefing">
      <p className="briefing__lead">
        {data.settings.displayName ? `Here’s your day, ${data.settings.displayName}.` : 'Here’s your day.'}
      </p>
      <ul className="briefing-list">
        <li>
          <TaskIcon size={15} />
          <span>
            {openTasks.length === 0
              ? 'No open tasks.'
              : `${openTasks.length} open ${openTasks.length === 1 ? 'task' : 'tasks'}${
                  dueToday.length ? `, ${dueToday.length} due today` : ''
                }.`}
          </span>
        </li>
        <li>
          <PinIcon size={15} />
          <span>
            {eventsToday.length === 0
              ? 'No events on your Luma calendar today.'
              : `${eventsToday.length} ${eventsToday.length === 1 ? 'event' : 'events'} today.`}
          </span>
        </li>
        <li>
          <FlameIcon size={15} />
          <span>
            {habitList.length === 0
              ? 'No habits tracked yet.'
              : `${habitsDone} of ${habitList.length} habits done.`}
          </span>
        </li>
        <li>
          <NoteIcon size={15} />
          <span>
            {data.notes.length === 0
              ? 'No notes saved.'
              : `${data.notes.length} ${data.notes.length === 1 ? 'note' : 'notes'} saved.`}
          </span>
        </li>
      </ul>
      <p className="widget-hint">Built from your own dashboard — no external service involved.</p>
    </WidgetCard>
  );
}

/* ----------------------------------------------------------- Productivity analytics */

export function ProductivityAnalyticsWidget() {
  const { data } = useDashboard();
  const [habits] = useWidgetState<HabitState>('habits', { habits: [] });
  const days = lastNDays(7);
  const habitList = readHabits(habits);

  const bars = useMemo(
    () =>
      days.map((day) => {
        const tasks = data.tasks.filter(
          (task) =>
            task.completedAt !== null && isoDay(new Date(task.completedAt)) === day,
        ).length;
        const habitTicks = habitList.filter((habit) => habit.days.includes(day)).length;
        return { day, tasks, habits: habitTicks, total: tasks + habitTicks };
      }),
    [data.tasks, habitList, days],
  );

  const max = Math.max(1, ...bars.map((bar) => bar.total));
  const completed = data.tasks.filter((task) => task.done).length;

  return (
    <WidgetCard title="Productivity">
      <div className="analysis-row">
        <div>
          <span className="analysis-value">{completed}</span>
          <span className="analysis-label">tasks done</span>
        </div>
        <div>
          <span className="analysis-value">{habitList.length}</span>
          <span className="analysis-label">habits</span>
        </div>
      </div>
      <div className="spark-bars" role="img" aria-label="Completed tasks and habit ticks over the last seven days">
        {bars.map((bar) => (
          <div key={bar.day} className="spark-bars__column" title={`${shortWeekday(bar.day)}: ${bar.total}`}>
            <span
              className="spark-bars__bar"
              style={{ height: `${Math.max(6, (bar.total / max) * 100)}%` }}
            />
            <span className="spark-bars__label">{shortWeekday(bar.day).slice(0, 1)}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ----------------------------------------------------------------------- Kanban */

type KanbanColumn = 'todo' | 'doing' | 'done';

interface KanbanCard {
  id: string;
  text: string;
  column: KanbanColumn;
}

interface KanbanState extends Record<string, unknown> {
  cards: KanbanCard[];
}

const KANBAN_COLUMNS: Array<{ id: KanbanColumn; label: string }> = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
];

export function KanbanWidget() {
  const [state, setState] = useWidgetState<KanbanState>('kanban', { cards: [] });
  const cards = Array.isArray(state.cards) ? state.cards : [];
  const [draft, setDraft] = useState('');

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setState({ cards: [...cards, { id: createId('card'), text, column: 'todo' }] });
    setDraft('');
  };

  const move = (card: KanbanCard, direction: -1 | 1) => {
    const index = KANBAN_COLUMNS.findIndex((column) => column.id === card.column);
    const target = KANBAN_COLUMNS[index + direction];
    if (!target) return;
    setState({
      cards: cards.map((entry) => (entry.id === card.id ? { ...entry, column: target.id } : entry)),
    });
  };

  return (
    <WidgetCard title="Kanban board">
      <div className="kanban">
        {KANBAN_COLUMNS.map((column) => (
          <div key={column.id} className="kanban__column">
            <p className="kanban__title">{column.label}</p>
            <ul className="kanban__list">
              {cards
                .filter((card) => card.column === column.id)
                .map((card) => (
                  <li key={card.id} className="kanban__card">
                    <span>{card.text}</span>
                    <div className="kanban__actions">
                      <IconButton
                        label={`Move “${card.text}” left`}
                        disabled={column.id === 'todo'}
                        onClick={() => move(card, -1)}
                      >
                        ‹
                      </IconButton>
                      <IconButton
                        label={`Move “${card.text}” right`}
                        disabled={column.id === 'done'}
                        onClick={() => move(card, 1)}
                      >
                        ›
                      </IconButton>
                      <IconButton
                        label={`Delete card “${card.text}”`}
                        danger
                        onClick={() => setState({ cards: cards.filter((entry) => entry.id !== card.id) })}
                      >
                        <TrashIcon size={13} />
                      </IconButton>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <form className="inline-form" onSubmit={add}>
        <Input
          value={draft}
          maxLength={100}
          placeholder="Add a card…"
          aria-label="New kanban card"
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!draft.trim()}>
          Add
        </Button>
      </form>
    </WidgetCard>
  );
}

/* --------------------------------------------------------------------- AI plan */

export function AiPlanWidget() {
  return (
    <WidgetCard title="AI daily plan">
      <EmptyState
        icon={<SparkIcon size={20} />}
        title="No assistant connected"
        text="Luma has no AI service connected in this build, so there is no generated plan to show. The widget is ready for one when an assistant is added."
      />
    </WidgetCard>
  );
}

