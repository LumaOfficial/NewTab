export type AccountView =
  | 'overview'
  | 'devices'
  | 'sync'
  | 'integrations'
  | 'privacy'
  | 'trash';

export interface AccountNavItem {
  id: AccountView;
  label: string;
}

export const ACCOUNT_VIEWS: AccountNavItem[] = [
  { id: 'overview', label: 'Account' },
  { id: 'devices', label: 'Connected devices' },
  { id: 'sync', label: 'Sync' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'privacy', label: 'Privacy & data' },
  { id: 'trash', label: 'Recently deleted' },
];
