import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../lib/utils';
import { DotsIcon } from '../icons';
import { IconButton } from './IconButton';

export interface MenuItemSpec {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

export interface MenuProps {
  /** Accessible name for the trigger, e.g. "Shortcut options". */
  label: string;
  items: MenuItemSpec[];
  trigger?: ReactNode;
  triggerClassName?: string;
}

/** Overflow menu: click the trigger, choose an action, closes on select/Escape. */
export function Menu({ label, items, trigger, triggerClassName }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    // Move focus into the menu so keyboard users land on the first action.
    const focusTimer = window.setTimeout(() => {
      popoverRef.current?.querySelector<HTMLElement>('.menu-item:not(:disabled)')?.focus();
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const handlePopoverKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const focusable = Array.from(
      popoverRef.current?.querySelectorAll<HTMLElement>('.menu-item:not(:disabled)') ?? [],
    );
    if (focusable.length === 0) return;

    event.preventDefault();
    const index = focusable.indexOf(document.activeElement as HTMLElement);
    const nextIndex =
      event.key === 'ArrowDown'
        ? (index + 1) % focusable.length
        : (index - 1 + focusable.length) % focusable.length;
    focusable[nextIndex].focus();
  };

  return (
    <div className="menu-root" ref={rootRef}>
      <IconButton
        ref={triggerRef}
        label={label}
        className={cx(triggerClassName)}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger ?? <DotsIcon size={16} />}
      </IconButton>

      {open ? (
        <div className="menu-popover" role="menu" aria-label={label} ref={popoverRef} onKeyDown={handlePopoverKeyDown}>
          {items.map((item) => (
            <div key={item.id}>
              {item.separatorBefore ? <div className="menu-separator" /> : null}
              <button
                type="button"
                role="menuitem"
                className={cx('menu-item', item.danger && 'menu-item--danger')}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
