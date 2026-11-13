/** Deterministic accent hue for a shortcut's letter tile. */
export function hueFromText(text = '') {
  let hash = 0;
  for (const char of String(text)) {
    hash = (hash * 31 + char.codePointAt(0)) % 360;
  }
  return hash;
}
