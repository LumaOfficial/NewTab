import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog with the essentials a dashboard needs: focus in, Escape and
 * backdrop to close, focus returned to the trigger, and a Tab loop.
 */
export function Dialog({ open, title, description, onClose, children, footer, size = 'md' }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return undefined;

    const trigger = document.activeElement;
    const frame = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector('[data-autofocus]') ?? panelRef.current?.querySelector(FOCUSABLE);
      target?.focus();
    });

    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('is-locked');

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('is-locked');
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return createPortal(
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`dialog dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        ref={panelRef}
      >
        <div className="dialog__head">
          {title ? (
            <h2 className="dialog__title" id={titleId}>
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="dialog__desc" id={descriptionId}>
              {description}
            </p>
          ) : null}
        </div>
        {children}
        {footer ? <div className="dialog__footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
