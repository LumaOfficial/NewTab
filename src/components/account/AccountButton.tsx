import { useAccount } from '../../account/AccountProvider';
import { UserIcon } from '../icons';

/** Header control: shows the signed-in person, or invites a sign-in. */
export function AccountButton({ onClick }: { onClick: () => void }) {
  const { status, user } = useAccount();
  const signedIn = status === 'signed-in' && user !== null;
  const name = signedIn ? user.name.trim() || user.email.split('@')[0] : '';
  const label = signedIn ? name : status === 'checking' ? 'Account' : 'Sign in';
  const initial = signedIn ? (name || user.email).slice(0, 1).toUpperCase() : '';

  return (
    <button
      type="button"
      className="account-chip"
      onClick={onClick}
      title={signedIn ? `Signed in as ${user.email}` : 'Sign in to sync your dashboard'}
    >
      <span className="account-chip__avatar" aria-hidden="true">
        {initial || <UserIcon size={15} />}
      </span>
      <span className="account-chip__label">{label}</span>
    </button>
  );
}
