import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../lib/utils';

export interface IconButtonProps extends ComponentPropsWithRef<'button'> {
  /** Required: icon-only controls need an accessible name. */
  label: string;
  solid?: boolean;
  danger?: boolean;
  children: ReactNode;
}

export function IconButton({ label, solid, danger, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('icon-btn', solid && 'icon-btn--solid', danger && 'icon-btn--danger', className)}
      {...rest}
    >
      {children}
    </button>
  );
}
