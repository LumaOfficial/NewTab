import type { ReactNode } from 'react';
import { Button } from '../../ui/Button';

/** Settings-drawer entry that jumps into the account panel. */
export function AccountLinkSection({
  title,
  description,
  actionLabel,
  icon,
  onOpen,
}: {
  title: string;
  description: string;
  actionLabel: string;
  icon?: ReactNode;
  onOpen: () => void;
}) {
  return (
    <section className="settings__section">
      <div>
        <h3 className="settings__section-title">{title}</h3>
        <p className="settings__section-intro">{description}</p>
      </div>
      <div>
        <Button variant="primary" icon={icon} onClick={onOpen}>
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}
