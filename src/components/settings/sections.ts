/** Navigation model for the settings drawer. New sections are added here. */
export type SettingsSectionId =
  | 'appearance'
  | 'widgets'
  | 'shortcuts'
  | 'data'
  | 'trash'
  | 'about'
  | 'accounts'
  | 'integrations'
  | 'ai'
  | 'workspaces'
  | 'themes'
  | 'privacy';

export interface SettingsSection {
  id: SettingsSectionId;
  label: string;
  /** Reserved for a later phase; the section exists but does nothing yet. */
  soon?: boolean;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'widgets', label: 'Dashboard widgets' },
  { id: 'shortcuts', label: 'Shortcuts' },
  { id: 'data', label: 'Data & storage' },
  { id: 'trash', label: 'Recently deleted' },
  { id: 'about', label: 'About Luma New Tab' },
  { id: 'accounts', label: 'Account & sync' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'privacy', label: 'Privacy & security' },
  { id: 'ai', label: 'AI features', soon: true },
  { id: 'workspaces', label: 'Workspaces', soon: true },
  { id: 'themes', label: 'Advanced themes', soon: true },
];
