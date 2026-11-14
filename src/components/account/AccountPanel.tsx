import { useEffect, useState, type ReactNode } from 'react';
import { useAccount } from '../../account/AccountProvider';
import { ACCOUNT_VIEWS, type AccountView } from '../../account/views';
import { cx } from '../../lib/utils';
import { Dialog } from '../ui/Dialog';
import { AccountOverview } from './AccountOverview';
import { AuthFlow } from './AuthFlow';
import { DevicesSection } from './DevicesSection';
import { IntegrationsSection } from './IntegrationsSection';
import { PrivacySection } from './PrivacySection';
import { Spinner } from './StatusNote';
import { SyncSection } from './SyncSection';
import { TrashSection } from './TrashSection';
import { CloudIcon, GridIcon, MonitorIcon, PlugIcon, ShieldIcon, TrashIcon } from '../icons';

const VIEW_ICONS: Record<AccountView, ReactNode> = {
  overview: <GridIcon size={15} />,
  devices: <MonitorIcon size={15} />,
  sync: <CloudIcon size={15} />,
  integrations: <PlugIcon size={15} />,
  privacy: <ShieldIcon size={15} />,
  trash: <TrashIcon size={15} />,
};

function renderView(view: AccountView, navigate: (next: AccountView) => void) {
  switch (view) {
    case 'devices':
      return <DevicesSection />;
    case 'sync':
      return <SyncSection />;
    case 'integrations':
      return <IntegrationsSection />;
    case 'privacy':
      return <PrivacySection />;
    case 'trash':
      return <TrashSection />;
    default:
      return <AccountOverview onNavigate={navigate} />;
  }
}

export interface AccountPanelProps {
  open: boolean;
  onClose: () => void;
  initialView?: AccountView;
}

/**
 * Account home: sign-in and recovery when signed out, and the account, sync,
 * integration and privacy screens when signed in. The dashboard behind it is
 * never blocked — closing the panel returns to the same local state.
 */
export function AccountPanel({ open, onClose, initialView = 'overview' }: AccountPanelProps) {
  const { status, user, notice, clearNotice } = useAccount();
  const [view, setView] = useState<AccountView>(initialView);

  useEffect(() => {
    if (open) setView(initialView);
  }, [open, initialView]);

  const signedIn = status === 'signed-in' && user !== null;

  return (
    <Dialog
      open={open}
      variant="panel"
      wide
      title={signedIn ? 'Your account' : 'Luma account'}
      description={
        signedIn ? user.email : 'Sign in to sync your dashboard across devices. Everything works offline without one.'
      }
      onClose={onClose}
    >
      {status === 'checking' ? (
        <div className="account-loading">
          <Spinner label="Checking your session…" />
        </div>
      ) : signedIn ? (
        <>
          {notice ? (
            <div className="account-notice" role="status">
              <span>{notice}</span>
              <button type="button" className="link-btn" onClick={clearNotice}>
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="account">
            <nav className="account__nav" aria-label="Account sections">
              {ACCOUNT_VIEWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cx('account__nav-item', view === item.id && 'account__nav-item--active')}
                  aria-current={view === item.id ? 'true' : undefined}
                  onClick={() => setView(item.id)}
                >
                  {VIEW_ICONS[item.id]}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="account__content">{renderView(view, setView)}</div>
          </div>
        </>
      ) : (
        <AuthFlow />
      )}
    </Dialog>
  );
}
