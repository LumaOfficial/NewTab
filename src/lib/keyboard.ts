/** Keyboard shortcut parsing and formatting shared by settings and the page. */

export interface ParsedShortcut {
  mod: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
}

export function parseShortcut(value: string): ParsedShortcut {
  const parts = value
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    mod: parts.includes('mod') || parts.includes('cmd') || parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('option'),
    key: parts.find((part) => !['mod', 'cmd', 'ctrl', 'shift', 'alt', 'option'].includes(part)) ?? '',
  };
}

export function matchesShortcut(event: KeyboardEvent, value: string): boolean {
  const shortcut = parseShortcut(value);
  if (!shortcut.key) return false;
  const modPressed = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();

  return (
    modPressed === shortcut.mod &&
    event.shiftKey === shortcut.shift &&
    event.altKey === shortcut.alt &&
    (key === shortcut.key || (shortcut.key === 'space' && event.code === 'Space'))
  );
}

/** Human label for the current platform. */
export function formatShortcut(value: string): string {
  if (!value) return 'Not set';
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);
  return value
    .split('+')
    .map((part) => {
      const piece = part.trim().toLowerCase();
      if (piece === 'mod') return isMac ? '⌘' : 'Ctrl';
      if (piece === 'shift') return isMac ? '⇧' : 'Shift';
      if (piece === 'alt' || piece === 'option') return isMac ? '⌥' : 'Alt';
      if (piece === 'space') return 'Space';
      return piece.length === 1 ? piece.toUpperCase() : piece.charAt(0).toUpperCase() + piece.slice(1);
    })
    .join(isMac ? '' : ' + ');
}

/** Turn a keydown into a stored shortcut string, if it contains a real key. */
export function shortcutFromEvent(event: KeyboardEvent): string | null {
  const key = event.key.toLowerCase();
  if (['control', 'meta', 'shift', 'alt', 'capslock', 'tab', 'escape'].includes(key)) return null;
  if (event.key === ' ') return [event.metaKey || event.ctrlKey ? 'mod' : '', 'space'].filter(Boolean).join('+');

  const parts: string[] = [];
  if (event.metaKey || event.ctrlKey) parts.push('mod');
  if (event.shiftKey) parts.push('shift');
  if (event.altKey) parts.push('alt');
  parts.push(key);
  return parts.join('+');
}
