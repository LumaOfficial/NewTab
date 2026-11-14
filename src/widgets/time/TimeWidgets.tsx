import { useState, type FormEvent } from 'react';
import { useDashboard } from '../../state/DashboardProvider';
import { createId } from '../../lib/utils';
import {
  dayOfYear,
  daysUntil,
  isoDay,
  parseIsoDay,
  relativeDay,
  todayIso,
  weekNumber,
} from '../../lib/dates';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Field';
import { IconButton } from '../../components/ui/IconButton';
import { WidgetCard } from '../WidgetCard';
import { CalendarIcon, TimerIcon, TrashIcon } from '../../components/icons';
import { useNow, useWidgetConfig, useWidgetState } from '../hooks';

/* ------------------------------------------------------------------------- Date */

export function DateWidget() {
  const now = useNow(60_000);
  return (
    <WidgetCard title="Date">
      <div className="date-widget">
        <span className="date-widget__day">
          {now.toLocaleDateString(undefined, { weekday: 'long' })}
        </span>
        <span className="date-widget__date">
          {now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="date-widget__meta">
          Week {weekNumber(now)} · Day {dayOfYear(now)} of {now.getFullYear()}
        </span>
      </div>
    </WidgetCard>
  );
}

/* ------------------------------------------------------------------ World clocks */

function formatZone(date: Date, zone: string): string | null {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: zone,
    }).format(date);
  } catch {
    return null;
  }
}

export function WorldClocksWidget() {
  const config = useWidgetConfig<{ zones: string }>('world-clocks');
  const now = useNow(15_000);
  const zones = String(config.zones ?? '')
    .split(',')
    .map((zone) => zone.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <WidgetCard title="World clocks">
      {zones.length === 0 ? (
        <EmptyState
          icon={<TimerIcon size={20} />}
          title="No time zones yet"
          text="Add IANA time zones in this widget’s settings, for example Europe/London."
        />
      ) : (
        <ul className="world-clocks">
          {zones.map((zone) => {
            const time = formatZone(now, zone);
            const city = zone.split('/').pop()?.replace(/_/g, ' ') ?? zone;
            return (
              <li key={zone} className="world-clocks__row">
                <span className="world-clocks__city">{city}</span>
                <span className={time ? 'world-clocks__time' : 'world-clocks__time world-clocks__time--invalid'}>
                  {time ?? 'Unknown zone'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="widget-hint">Edit the list in widget settings.</p>
    </WidgetCard>
  );
}

/* --------------------------------------------------------------------- Countdown */

export function CountdownWidget() {
  const config = useWidgetConfig<{ label: string; target: string }>('countdown');
  const now = useNow(1000);
  const target = parseIsoDay(String(config.target ?? ''));

  const diff = target ? target.getTime() - now.getTime() : null;
  const days = diff !== null ? Math.floor(diff / 86_400_000) : null;
  const hours = diff !== null ? Math.floor((diff % 86_400_000) / 3_600_000) : null;

  return (
    <WidgetCard title="Countdown">
      {!target || diff === null ? (
        <p className="widget-hint">
          Set a target date in this widget’s settings to start counting down.
        </p>
      ) : diff <= 0 ? (
        <div className="countdown">
          <span className="countdown__value">Done</span>
          <span className="countdown__label">{config.label || 'That date'} has passed.</span>
        </div>
      ) : (
        <div className="countdown">
          <span className="countdown__value">{days}</span>
          <span className="countdown__label">
            {days === 1 ? 'day' : 'days'} and {hours}h until {config.label || 'your date'}
          </span>
        </div>
      )}
    </WidgetCard>
  );
}

/* --------------------------------------------------------------- Calendar agenda */

export function CalendarAgendaWidget() {
  const { data, dispatch } = useDashboard();
  const config = useWidgetConfig<{ days: number }>('calendar-agenda');
  const daysAhead = Math.min(14, Math.max(1, Number(config.days) || 3));
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState('');

  const limit = isoDay(new Date(Date.now() + daysAhead * 86_400_000));
  const events = data.events.filter((event) => event.date >= todayIso() && event.date <= limit);

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !parseIsoDay(date)) return;
    dispatch({
      type: 'event/add',
      event: { id: createId('event'), title: trimmed, date, time, notes: '' },
    });
    setTitle('');
    setTime('');
  };

  return (
    <WidgetCard title={`Agenda · ${daysAhead} ${daysAhead === 1 ? 'day' : 'days'}`}>
      {events.length === 0 ? (
        <p className="widget-hint">No events in this window. Add one below.</p>
      ) : (
        <ul className="agenda">
          {events.map((event) => (
            <li key={event.id} className="agenda__row">
              <span className="agenda__date">{relativeDay(event.date)}</span>
              <span className="agenda__title">{event.title}</span>
              {event.time ? <span className="agenda__time">{event.time}</span> : null}
              <IconButton
                label={`Delete event “${event.title}”`}
                danger
                onClick={() => dispatch({ type: 'event/delete', id: event.id })}
              >
                <TrashIcon size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <form className="inline-form inline-form--wrap" onSubmit={add}>
        <Input
          value={title}
          maxLength={120}
          placeholder="Add an event…"
          aria-label="New event title"
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          type="date"
          value={date}
          aria-label="Event date"
          onChange={(event) => setDate(event.target.value)}
        />
        <Input
          className="input--time"
          type="time"
          value={time}
          aria-label="Event time"
          onChange={(event) => setTime(event.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!title.trim()}>
          Add
        </Button>
      </form>
    </WidgetCard>
  );
}

/* ------------------------------------------------------------- Upcoming events */

export function UpcomingEventsWidget() {
  const { data } = useDashboard();
  const upcoming = data.events
    .filter((event) => event.date >= todayIso())
    .slice(0, 4);

  return (
    <WidgetCard title="Upcoming events">
      {upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={20} />}
          title="Nothing coming up"
          text="Events you add to the agenda appear here too."
        />
      ) : (
        <ul className="agenda">
          {upcoming.map((event) => (
            <li key={event.id} className="agenda__row">
              <span className="agenda__date">{relativeDay(event.date)}</span>
              <span className="agenda__title">{event.title}</span>
              {event.time ? <span className="agenda__time">{event.time}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

/* --------------------------------------------------------------------- Birthdays */

interface Birthday {
  id: string;
  name: string;
  /** `MM-DD` or a full ISO day. */
  date: string;
}

interface BirthdayState extends Record<string, unknown> {
  people: Birthday[];
}

export function BirthdaysWidget() {
  const [state, setState] = useWidgetState<BirthdayState>('birthdays', { people: [] });
  const people = Array.isArray(state.people) ? state.people : [];
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const now = new Date();

  const withDays = people
    .map((person) => {
      const parts = person.date.split('-');
      const monthDay = parts.length === 3 ? `${parts[1]}-${parts[2]}` : person.date;
      const [month, day] = monthDay.split('-').map(Number);
      let next = new Date(now.getFullYear(), (month || 1) - 1, day || 1);
      if (next.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
        next = new Date(now.getFullYear() + 1, (month || 1) - 1, day || 1);
      }
      const days = Math.round(
        (next.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
          86_400_000,
      );
      return { ...person, days, label: monthDay };
    })
    .sort((a, b) => a.days - b.days);

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    setState({ people: [...people, { id: createId('birthday'), name: trimmed, date }] });
    setName('');
    setDate('');
  };

  return (
    <WidgetCard title="Birthdays">
      {withDays.length === 0 ? (
        <p className="widget-hint">Add a birthday and Luma counts down to it.</p>
      ) : (
        <ul className="agenda">
          {withDays.slice(0, 5).map((person) => (
            <li key={person.id} className="agenda__row">
              <span className="agenda__title">{person.name}</span>
              <span className="agenda__date">
                {person.days === 0 ? 'Today' : person.days === 1 ? 'Tomorrow' : `${person.days} days`}
              </span>
              <IconButton
                label={`Remove ${person.name}`}
                danger
                onClick={() => setState({ people: people.filter((entry) => entry.id !== person.id) })}
              >
                <TrashIcon size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <form className="inline-form inline-form--wrap" onSubmit={add}>
        <Input
          value={name}
          placeholder="Name"
          aria-label="Birthday name"
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          type="date"
          value={date}
          aria-label="Birthday date"
          onChange={(event) => setDate(event.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!name.trim() || !date}>
          Add
        </Button>
      </form>
    </WidgetCard>
  );
}

/* ----------------------------------------------------------- Deadline reminders */

export function DeadlineRemindersWidget() {
  const { data, dispatch } = useDashboard();
  const withDue = data.tasks
    .filter((task) => task.dueAt !== null && !task.done)
    .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))
    .slice(0, 5);

  return (
    <WidgetCard title="Deadlines">
      {withDue.length === 0 ? (
        <EmptyState
          icon={<TimerIcon size={20} />}
          title="No deadlines"
          text="Give a task a due date and it appears here, closest first."
        />
      ) : (
        <ul className="deadline-list">
          {withDue.map((task) => {
            const days = daysUntil(task.dueAt ?? '');
            const tone = days === null ? '' : days < 0 ? 'is-overdue' : days === 0 ? 'is-today' : '';
            return (
              <li key={task.id} className={`deadline ${tone}`}>
                <input
                  type="checkbox"
                  checked={false}
                  aria-label={`Mark “${task.text}” done`}
                  onChange={() => dispatch({ type: 'task/toggle', id: task.id })}
                />
                <span className="deadline__text">{task.text}</span>
                <span className="deadline__when">
                  {days === null
                    ? 'No date'
                    : days < 0
                      ? `${Math.abs(days)}d overdue`
                      : days === 0
                        ? 'Today'
                        : days === 1
                          ? 'Tomorrow'
                          : `${days}d`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}

