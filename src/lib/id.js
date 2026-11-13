/** Short, URL-safe random ids for shortcuts, notes and tasks. */
export function createId(prefix = 'item') {
  const unique = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${unique}`;
}
