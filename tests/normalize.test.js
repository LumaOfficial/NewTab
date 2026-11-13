import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultState, WIDGET_IDS } from '../src/lib/defaults.js';
import { normalizeState } from '../src/lib/normalize.js';

test('missing or invalid input yields fresh defaults', () => {
  assert.deepEqual(normalizeState(null), createDefaultState());
  assert.deepEqual(normalizeState('nope'), createDefaultState());
  assert.deepEqual(normalizeState({}), createDefaultState());
});

test('invalid settings fall back to defaults', () => {
  const state = normalizeState({ settings: { theme: 'neon', clockFormat: '11h', searchEngine: 'altavista', displayName: 42 } });
  assert.equal(state.settings.theme, 'system');
  assert.equal(state.settings.clockFormat, '12h');
  assert.equal(state.settings.searchEngine, 'duckduckgo');
  assert.equal(state.settings.displayName, '');
});

test('widget order is deduplicated and completed with missing widgets', () => {
  const state = normalizeState({ layout: { order: ['tasks', 'tasks', 'ghost', 'clock'], hidden: ['notes', 'ghost'] } });
  assert.deepEqual(state.layout.order, ['tasks', 'clock', ...WIDGET_IDS.filter((id) => id !== 'tasks' && id !== 'clock')]);
  assert.deepEqual(state.layout.hidden, ['notes']);
});

test('malformed shortcuts are dropped and valid ones normalized', () => {
  const state = normalizeState({
    shortcuts: [
      { id: 'sc_abc12345', label: '  My site  ', url: 'example.com' },
      { url: 'javascript:alert(1)' },
      null,
      { label: 'No url' },
    ],
  });
  assert.equal(state.shortcuts.length, 1);
  assert.equal(state.shortcuts[0].label, 'My site');
  assert.equal(state.shortcuts[0].url, 'https://example.com/');
  assert.equal(state.shortcuts[0].id, 'sc_abc12345');
});

test('shortcut labels default to the hostname', () => {
  const state = normalizeState({ shortcuts: [{ url: 'https://www.example.org/docs' }] });
  assert.equal(state.shortcuts[0].label, 'example.org');
});

test('tasks and notes keep only usable entries', () => {
  const state = normalizeState({
    tasks: [{ text: '  Ship it  ', done: 'yes' }, { text: '   ' }, { text: 'Later', done: true, createdAt: 5 }],
    notes: [{ text: 'line one\n\n\n\nline two' }, { text: '' }],
  });

  assert.deepEqual(
    state.tasks.map((task) => [task.text, task.done]),
    [['Ship it', false], ['Later', true]],
  );
  assert.equal(state.tasks[1].createdAt, 5);
  assert.equal(state.notes.length, 1);
  assert.equal(state.notes[0].text, 'line one\n\nline two');
  assert.ok(Number.isFinite(state.notes[0].updatedAt));
});
