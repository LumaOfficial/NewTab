import test from 'node:test';
import assert from 'node:assert/strict';

import { formatRelative, getClockParts, getGreeting } from '../src/lib/time.js';

function at(hour, minute = 0) {
  return new Date(2026, 10, 13, hour, minute, 0);
}

test('greeting follows the time of day', () => {
  assert.equal(getGreeting(at(3)), 'Good night');
  assert.equal(getGreeting(at(8)), 'Good morning');
  assert.equal(getGreeting(at(14)), 'Good afternoon');
  assert.equal(getGreeting(at(19)), 'Good evening');
  assert.equal(getGreeting(at(23, 30)), 'Good night');
});

test('12-hour clock keeps the period, 24-hour clock omits it', () => {
  const twelve = getClockParts(at(19, 5), '12h');
  assert.equal(twelve.minutes, '05');
  assert.ok(twelve.dayPeriod.length > 0);

  const twentyFour = getClockParts(at(19, 5), '24h');
  assert.equal(twentyFour.hours, '19');
  assert.equal(twentyFour.dayPeriod, '');
});

test('relative labels stay compact', () => {
  const now = at(12).getTime();
  assert.equal(formatRelative(now - 5_000, now), 'just now');
  assert.equal(formatRelative(now - 12 * 60_000, now), '12m ago');
  assert.equal(formatRelative(now - 3 * 3_600_000, now), '3h ago');
  assert.equal(formatRelative(now - 26 * 3_600_000, now), 'yesterday');
});
