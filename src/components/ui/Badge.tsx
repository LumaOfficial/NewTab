import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';

export function Badge({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <span className={cx('badge', muted && 'badge--muted')}>{children}</span>;
}
