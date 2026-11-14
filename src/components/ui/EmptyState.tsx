import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-state__icon">{icon}</div> : null}
      <p className="empty-state__title">{title}</p>
      {text ? <p className="empty-state__text">{text}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
