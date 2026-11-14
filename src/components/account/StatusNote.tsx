import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';

export type StatusTone = 'info' | 'success' | 'warning' | 'error';

export interface StatusNoteProps {
  tone?: StatusTone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}

/** Inline feedback block: loading is a separate `busy` flag on the caller. */
export function StatusNote({ tone = 'info', title, children, action }: StatusNoteProps) {
  return (
    <div className={cx('status-note', `status-note--${tone}`)} role={tone === 'error' ? 'alert' : 'status'}>
      <div className="status-note__text">
        {title ? <strong className="status-note__title">{title}</strong> : null}
        {children ? <span>{children}</span> : null}
      </div>
      {action ? <div className="status-note__action">{action}</div> : null}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="spinner" role="status" aria-live="polite">
      <span className="spinner__dot" aria-hidden="true" />
      {label ? <span className="spinner__label">{label}</span> : null}
    </span>
  );
}
