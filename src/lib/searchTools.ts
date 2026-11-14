/**
 * Local search intelligence: arithmetic, unit conversion, quick commands and
 * matches from the dashboard and browser. Everything runs on the device.
 *
 * Definitions, translations, quick facts and AI answers are deliberately not
 * implemented — there is no connected service, and the UI says so instead of
 * inventing an answer.
 */

/* ------------------------------------------------------------------ calculator */

/** Recursive-descent arithmetic; never uses eval. */
export function evaluateExpression(input: string): string | null {
  const cleaned = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.').trim();
  if (!/^[-+*/%^().\d\s]+$/.test(cleaned)) return null;
  if (!/\d/.test(cleaned) || !/[-+*/%^]/.test(cleaned)) return null;

  let index = 0;
  const peek = () => cleaned[index];
  const skip = () => {
    while (/\s/.test(cleaned[index] ?? '')) index += 1;
  };

  function parseExpression(): number {
    let value = parseTerm();
    for (;;) {
      skip();
      const op = peek();
      if (op !== '+' && op !== '-') break;
      index += 1;
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parsePower();
    for (;;) {
      skip();
      const op = peek();
      if (op !== '*' && op !== '/' && op !== '%') break;
      index += 1;
      const rhs = parsePower();
      if ((op === '/' || op === '%') && rhs === 0) throw new Error('divide by zero');
      value = op === '*' ? value * rhs : op === '/' ? value / rhs : value % rhs;
    }
    return value;
  }

  function parsePower(): number {
    const base = parseUnary();
    skip();
    if (peek() === '^') {
      index += 1;
      return base ** parsePower();
    }
    return base;
  }

  function parseUnary(): number {
    skip();
    if (peek() === '-') {
      index += 1;
      return -parseUnary();
    }
    if (peek() === '+') {
      index += 1;
      return parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    skip();
    if (peek() === '(') {
      index += 1;
      const value = parseExpression();
      skip();
      if (peek() !== ')') throw new Error('missing )');
      index += 1;
      return value;
    }

    const start = index;
    while (/[\d.]/.test(cleaned[index] ?? '')) index += 1;
    if (start === index) throw new Error('number expected');
    const value = Number(cleaned.slice(start, index));
    if (!Number.isFinite(value)) throw new Error('bad number');
    return value;
  }

  try {
    const result = parseExpression();
    skip();
    if (index !== cleaned.length || !Number.isFinite(result)) return null;
    const rounded = Math.round(result * 1e10) / 1e10;
    return `${rounded}`;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------- unit conversion */

const LENGTH: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  inch: 0.0254,
  inches: 0.0254,
  ft: 0.3048,
  foot: 0.3048,
  feet: 0.3048,
  yd: 0.9144,
  mile: 1609.344,
  miles: 1609.344,
  mi: 1609.344,
};

const MASS: Record<string, number> = {
  mg: 0.000001,
  g: 0.001,
  kg: 1,
  oz: 0.028349523125,
  lb: 0.45359237,
  lbs: 0.45359237,
  stone: 6.35029318,
  st: 6.35029318,
  ton: 1000,
};

const VOLUME: Record<string, number> = {
  ml: 0.001,
  l: 1,
  cup: 0.2365882365,
  pint: 0.473176473,
  quart: 0.946352946,
  gallon: 3.785411784,
  tbsp: 0.0147867648,
  tsp: 0.0049289216,
};

const TEMPERATURE = new Set(['c', 'f', 'k', '°c', '°f']);

function convertTemperature(value: number, from: string, to: string): number | null {
  const normalize = (unit: string) => unit.replace('°', '');
  const source = normalize(from);
  const target = normalize(to);

  const toCelsius =
    source === 'c' ? value : source === 'f' ? ((value - 32) * 5) / 9 : source === 'k' ? value - 273.15 : null;
  if (toCelsius === null) return null;

  if (target === 'c') return toCelsius;
  if (target === 'f') return (toCelsius * 9) / 5 + 32;
  if (target === 'k') return toCelsius + 273.15;
  return null;
}

export function convertUnits(input: string): string | null {
  const match = input
    .trim()
    .toLowerCase()
    .match(/^(-?\d+(?:\.\d+)?)\s*([a-z°]+)\s*(?:to|in|as)\s*([a-z°]+)$/);
  if (!match) return null;

  const value = Number(match[1]);
  const from = match[2];
  const to = match[3];
  if (!Number.isFinite(value)) return null;

  if (TEMPERATURE.has(from) && TEMPERATURE.has(to)) {
    const converted = convertTemperature(value, from, to);
    return converted === null ? null : `${round(converted)}°${to.replace('°', '').toUpperCase()}`;
  }

  const tables: Array<Record<string, number>> = [LENGTH, MASS, VOLUME];
  for (const table of tables) {
    if (table[from] !== undefined && table[to] !== undefined) {
      return `${round((value * table[from]) / table[to])} ${to}`;
    }
  }
  return null;
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/* ------------------------------------------------------------------- commands */

export interface SearchCommand {
  id: string;
  label: string;
  hint: string;
  keywords: string[];
}

export const SEARCH_COMMANDS: SearchCommand[] = [
  {
    id: 'new-note',
    label: 'New note',
    hint: 'Opens a blank note',
    keywords: ['new note', 'create note', 'note'],
  },
  {
    id: 'new-task',
    label: 'New task',
    hint: 'Jumps to the task composer',
    keywords: ['new task', 'add task', 'todo'],
  },
  {
    id: 'focus-mode',
    label: 'Start focus mode',
    hint: 'Opens the focus timer',
    keywords: ['focus', 'start focus', 'focus mode', 'timer'],
  },
  {
    id: 'settings',
    label: 'Open settings',
    hint: 'Appearance, widgets and layouts',
    keywords: ['settings', 'preferences'],
  },
  {
    id: 'theme',
    label: 'Change theme',
    hint: 'Browse built-in and custom themes',
    keywords: ['theme', 'dark mode', 'light mode', 'appearance'],
  },
  {
    id: 'workspace',
    label: 'Switch workspace',
    hint: 'Move between your workspaces',
    keywords: ['workspace', 'switch', 'school', 'work'],
  },
  {
    id: 'layout',
    label: 'Change layout',
    hint: 'Presets, saved layouts and widget sizes',
    keywords: ['layout', 'dashboard', 'grid'],
  },
];

/* ---------------------------------------------------------------- suggestions */

export type SuggestionKind =
  | 'command'
  | 'calculation'
  | 'conversion'
  | 'shortcut'
  | 'note'
  | 'task'
  | 'bookmark'
  | 'tab'
  | 'history'
  | 'extension'
  | 'web';

export interface Suggestion {
  id: string;
  kind: SuggestionKind;
  label: string;
  detail: string;
  /** Present when selecting the suggestion should open a URL. */
  url?: string;
  /** Command id when selecting should run a command. */
  commandId?: string;
}

export interface SuggestionContext {
  shortcuts: Array<{ id: string; title: string; url: string }>;
  notes: Array<{ id: string; title: string; body: string }>;
  tasks: Array<{ id: string; text: string }>;
  bookmarks?: Array<{ id: string; title: string; url: string }> | null;
  tabs?: Array<{ id: string; title: string; url: string }> | null;
  history?: Array<{ id: string; title: string; url: string }> | null;
  extensions?: Array<{ id: string; title: string; url: string }> | null;
}

export function buildSuggestions(query: string, context: SuggestionContext): Suggestion[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();

  const results: Suggestion[] = [];

  const calculation = evaluateExpression(trimmed);
  if (calculation !== null) {
    results.push({
      id: 'calc',
      kind: 'calculation',
      label: `${trimmed} = ${calculation}`,
      detail: 'Calculation · local',
    });
  }

  const conversion = convertUnits(trimmed);
  if (conversion !== null) {
    results.push({
      id: 'convert',
      kind: 'conversion',
      label: `${trimmed} = ${conversion}`,
      detail: 'Unit conversion · local',
    });
  }

  for (const command of SEARCH_COMMANDS) {
    if (command.keywords.some((keyword) => lower.startsWith(keyword) || lower.includes(keyword))) {
      results.push({
        id: `command-${command.id}`,
        kind: 'command',
        label: command.label,
        detail: command.hint,
        commandId: command.id,
      });
    }
  }

  const matches = (text: string) => text.toLowerCase().includes(lower);

  for (const shortcut of context.shortcuts) {
    if (matches(shortcut.title) || matches(shortcut.url)) {
      results.push({
        id: `shortcut-${shortcut.id}`,
        kind: 'shortcut',
        label: shortcut.title,
        detail: 'Shortcut',
        url: shortcut.url,
      });
    }
  }

  for (const note of context.notes) {
    if (matches(note.title) || matches(note.body)) {
      results.push({
        id: `note-${note.id}`,
        kind: 'note',
        label: note.title || 'Untitled note',
        detail: `Note · ${note.body.slice(0, 60)}`,
      });
    }
  }

  for (const task of context.tasks) {
    if (matches(task.text)) {
      results.push({ id: `task-${task.id}`, kind: 'task', label: task.text, detail: 'Task' });
    }
  }

  for (const bookmark of context.bookmarks ?? []) {
    if (matches(bookmark.title) || matches(bookmark.url)) {
      results.push({
        id: `bookmark-${bookmark.id}`,
        kind: 'bookmark',
        label: bookmark.title,
        detail: 'Bookmark',
        url: bookmark.url,
      });
    }
  }

  for (const tab of context.tabs ?? []) {
    if (matches(tab.title) || matches(tab.url)) {
      results.push({ id: `tab-${tab.id}`, kind: 'tab', label: tab.title, detail: 'Open tab', url: tab.url });
    }
  }

  for (const item of context.history ?? []) {
    if (matches(item.title) || matches(item.url)) {
      results.push({
        id: `history-${item.id}`,
        kind: 'history',
        label: item.title,
        detail: 'From history',
        url: item.url,
      });
    }
  }

  for (const extension of context.extensions ?? []) {
    if (matches(extension.title)) {
      results.push({
        id: `extension-${extension.id}`,
        kind: 'extension',
        label: extension.title,
        detail: 'Installed extension',
      });
    }
  }

  return results.slice(0, 8);
}
