import type { ReactNode } from 'react';
import { CloudIcon, LayersIcon, PaletteIcon, PlugIcon, ShieldIcon, SparkIcon } from '../icons';
import type { SettingsSectionId } from './sections';

export interface FutureSectionContent {
  title: string;
  description: string;
  planned: string[];
  icon: ReactNode;
}

/**
 * Placeholder content for sections reserved for a later phase. They are honest
 * about what is not built yet — no controls that pretend to work.
 */
export const FUTURE_SECTIONS: Partial<Record<SettingsSectionId, FutureSectionContent>> = {
  accounts: {
    title: 'Accounts & sync',
    description: 'Optional sign-in so your dashboard can follow you between browsers.',
    icon: <CloudIcon size={18} />,
    planned: [
      'Create an account or stay entirely local',
      'Encrypted sync of settings, shortcuts, notes and tasks',
      'Resolve changes across devices',
    ],
  },
  integrations: {
    title: 'Integrations',
    description: 'Connect outside services to bring their data into your new tab.',
    icon: <PlugIcon size={18} />,
    planned: [
      'Calendar and events widget',
      'Weather and forecast widget',
      'Bookmarks and reading list import',
    ],
  },
  ai: {
    title: 'AI features',
    description: 'Assistive tools layered on top of your own dashboard data.',
    icon: <SparkIcon size={18} />,
    planned: [
      'Daily summary of tasks and notes',
      'Turn a note into a task list',
      'Optional, clearly-scoped assistant actions',
    ],
  },
  workspaces: {
    title: 'Workspaces',
    description: 'Separate dashboards for different contexts, like work and personal.',
    icon: <LayersIcon size={18} />,
    planned: [
      'Create and switch between workspaces',
      'Per-workspace widgets, accents and shortcuts',
      'Workspace-aware sync when accounts arrive',
    ],
  },
  themes: {
    title: 'Advanced themes',
    description: 'Deeper control over Luma’s look, on top of light and dark.',
    icon: <PaletteIcon size={18} />,
    planned: [
      'Accent colour and background presets',
      'Custom wallpapers',
      'Typography and density options',
    ],
  },
  privacy: {
    title: 'Privacy & security',
    description: 'Visibility into what Luma stores and how it stays on your device.',
    icon: <ShieldIcon size={18} />,
    planned: [
      'Clear individual data categories',
      'Export and import a full backup',
      'Privacy review of every future integration',
    ],
  },
};
