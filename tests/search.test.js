import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSearchUrl, getSearchEngine } from '../src/lib/search.js';
import { normalizeShortcutUrl } from '../src/lib/url.js';

test('searches plain queries with the selected engine', () => {
  assert.equal(buildSearchUrl('cats', 'duckduckgo'), 'https://duckduckgo.com/?q=cats');
  assert.equal(buildSearchUrl('cats and dogs', 'google'), 'https://www.google.com/search?q=cats%20and%20dogs');
});

test('empty queries produce nothing to open', () => {
  assert.equal(buildSearchUrl('', 'duckduckgo'), null);
  assert.equal(buildSearchUrl('   ', 'duckduckgo'), null);
});

test('domain-like input is treated as a direct navigation', () => {
  assert.equal(buildSearchUrl('example.com', 'duckduckgo'), 'https://example.com/');
  assert.equal(buildSearchUrl('https://example.com/a?b=1', 'duckduckgo'), 'https://example.com/a?b=1');
});

test('unknown engines fall back to the first provider', () => {
  assert.equal(getSearchEngine('nope').id, 'duckduckgo');
});

test('unsafe schemes are searched, never navigated to', () => {
  const resolved = buildSearchUrl('javascript:alert(1)', 'duckduckgo');
  assert.equal(resolved, 'https://duckduckgo.com/?q=javascript%3Aalert(1)');
  assert.equal(normalizeShortcutUrl('javascript:alert(1)'), null);
});

test('shortcut urls require http or https', () => {
  assert.equal(normalizeShortcutUrl('example.com'), 'https://example.com/');
  assert.equal(normalizeShortcutUrl('ftp://example.com'), null);
  assert.equal(normalizeShortcutUrl(''), null);
  assert.equal(normalizeShortcutUrl('not a url'), null);
});
