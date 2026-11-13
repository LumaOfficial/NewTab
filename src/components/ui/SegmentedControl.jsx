import { useRef } from 'react';

/**
 * Single-select segmented control. Options are plain {value,label} objects;
 * arrow keys move the selection so the control is usable by keyboard.
 */
export function SegmentedControl({ label, value, options, onChange }) {
  const groupRef = useRef(null);

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = options[(index + delta + options.length) % options.length];
    onChange(next.value);
    groupRef.current?.querySelector(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div className="segmented" role="radiogroup" aria-label={label} ref={groupRef} onKeyDown={onKeyDown}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            data-value={option.value}
            tabIndex={checked ? 0 : -1}
            className="segmented__option"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
