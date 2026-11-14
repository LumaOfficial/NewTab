import type { ReactNode } from 'react';
import { SparkIcon } from '../icons';
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
  ai: {
    title: 'AI features',
    description: 'Assistive tools layered on top of your own dashboard data.',
    icon: <SparkIcon size={18} />,
    planned: [
      'A daily plan generated from your tasks, notes and calendar',
      'Search answers and summaries',
      'Explicit, reviewable actions on your own data',
    ],
  },
};
