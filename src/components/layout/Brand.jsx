import { Icon } from '../ui/Icon.jsx';

export function Brand({ size = 'md' }) {
  return (
    <div className={`brand brand--${size}`}>
      <span className="brand__mark" aria-hidden="true" />
      <span className="brand__name">Luma</span>
      <span className="brand__sub">New Tab</span>
    </div>
  );
}

export function ThemeToggleButton({ resolvedTheme, onToggle }) {
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <button type="button" className="btn btn--ghost btn--icon" aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} onClick={onToggle}>
      <Icon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} size={17} />
    </button>
  );
}
