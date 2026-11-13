/**
 * Accessible on/off switch (role="switch"), used for widget visibility and
 * other boolean settings.
 */
export function Switch({ label, checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__thumb" aria-hidden="true" />
    </button>
  );
}
