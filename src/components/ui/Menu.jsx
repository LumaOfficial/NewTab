import { useEffect, useRef, useState } from 'react';

import { Icon } from './Icon.jsx';
import { IconButton } from './Button.jsx';

/**
 * Small popover menu used by widget headers and the search bar.
 * Closes on outside click, Escape, or after choosing an item.
 */
export function Menu({ label, icon = 'more', items, align = 'end' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="menu" ref={containerRef}>
      <IconButton icon={icon} label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} />
      {open ? (
        <div className={`menu__popover menu__popover--${align}`} role="menu" aria-label={label}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`menu__item ${item.danger ? 'is-danger' : ''}`.trim()}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.active ? <Icon name="check" size={15} /> : item.icon ? <Icon name={item.icon} size={15} /> : <span className="menu__spacer" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
