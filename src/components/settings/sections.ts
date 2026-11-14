/** Navigation model for the settings drawer. New sections are added here. */
export type SettingsSectionId =
  | 'appearance'
  | 'themes'
  | 'layouts'
  | 'widgets'
  | 'workspaces'
  | 'accessibility'
  | 'shortcuts'
  | 'data'
  | 'trash'
  | 'onboarding'
  | 'about'
  | 'accounts'
  | 'integrations'
  | 'privacy'
  | 'ai';

export interface SettingsSection {
  id: SettingsSectionId;
  label: string;
  /** Reserved for a later phase; the section exists but does nothing yet. */
  soon?: boolean;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'themes', label: 'Themes & background' },
  { id: 'layouts', label: 'Layouts' },
  { id: 'widgets', label: 'Widget library' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'shortcuts', label: 'Shortcuts' },
  { id: 'data', label: 'Data & storage' },
  { id: 'trash', label: 'Recently deleted' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'accounts', label: 'Account & sync' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'privacy', label: 'Privacy & security' },
  { id: 'ai', label: 'AI features', soon: true },
  { id: 'about', label: 'About Luma New Tab' },
];
