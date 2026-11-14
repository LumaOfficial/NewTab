import type { ReactNode } from 'react';
import { cx } from '../lib/utils';
import { Card } from '../components/ui/Card';

export interface WidgetCardProps {
  title: string;
  /** Hero cards (clock, greeting) get extra height on wide screens. */
  hero?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}

/** Shared frame for every widget: title row, optional actions, body. */
export function WidgetCard({ title, hero = false, actions, children }: WidgetCardProps) {
  return (
    <Card className={cx('widget-card', hero && 'widget-card--hero')}>
      <div className="widget-card__header">
        <h2 className="widget-card__title">{title}</h2>
        {actions ? <div className="widget-card__actions">{actions}</div> : null}
      </div>
      {children}
    </Card>
  );
}
