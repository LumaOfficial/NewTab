/** Luma's brand mark: a warm-to-violet orb. Self-contained SVG, no assets. */
export function LumaMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="luma-mark-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#7d68ff" />
          <stop offset="52%" stopColor="#b596ff" />
          <stop offset="100%" stopColor="#ffb079" />
        </linearGradient>
        <radialGradient id="luma-mark-inner" cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.72" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#luma-mark-gradient)" />
      <circle cx="16" cy="16" r="6.6" fill="url(#luma-mark-inner)" />
    </svg>
  );
}
