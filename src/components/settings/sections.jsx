import { AboutSection } from './AboutSection.jsx';
import { AppearanceSection } from './AppearanceSection.jsx';
import { ComingSoonSection } from './ComingSoonSection.jsx';
import { DataSection } from './DataSection.jsx';
import { ShortcutsSection } from './ShortcutsSection.jsx';
import { WidgetsSection } from './WidgetsSection.jsx';

/**
 * Settings navigation. Implemented sections render a real component; future
 * features are declared here with `planned: true` so they can be built later
 * without changing the panel itself.
 */
export const SETTINGS_SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: 'palette', Component: AppearanceSection },
  { id: 'widgets', label: 'Dashboard widgets', icon: 'grid', Component: WidgetsSection },
  { id: 'shortcuts', label: 'Shortcuts', icon: 'link', Component: ShortcutsSection },
  { id: 'data', label: 'Data & storage', icon: 'database', Component: DataSection },
  { id: 'about', label: 'About Luma', icon: 'info', Component: AboutSection },
  {
    id: 'accounts',
    label: 'Accounts & sync',
    icon: 'cloud',
    planned: true,
    Component: ComingSoonSection,
    title: 'Accounts & sync',
    summary: 'Sign in once and keep your dashboard on every device.',
    bullets: [
      'Account creation and sign-in',
      'Sync for shortcuts, notes, tasks and preferences',
      'Backup history and conflict handling',
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'plug',
    planned: true,
    Component: ComingSoonSection,
    title: 'Integrations',
    summary: 'Connect the services you already use, one at a time.',
    bullets: ['Calendar and weather providers', 'Bookmark and reading-list import', 'Connections you approve individually'],
  },
  {
    id: 'ai',
    label: 'AI features',
    icon: 'wand',
    planned: true,
    Component: ComingSoonSection,
    title: 'AI features',
    summary: 'Optional, opt-in helpers for planning and recall.',
    bullets: ['Suggestions you explicitly ask for', 'Clear controls for anything processed off-device', 'On-device-first defaults'],
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    icon: 'layers',
    planned: true,
    Component: ComingSoonSection,
    title: 'Workspaces',
    summary: 'Save and switch between different dashboard layouts.',
    bullets: ['Per-workspace shortcuts and widgets', 'Quick switching from the new-tab page', 'Shared workspaces, when accounts arrive'],
  },
  {
    id: 'themes',
    label: 'Advanced themes',
    icon: 'sparkles',
    planned: true,
    Component: ComingSoonSection,
    title: 'Advanced themes',
    summary: 'Make the dashboard yours with deeper visual controls.',
    bullets: ['Custom accent colors and backgrounds', 'Per-widget styling', 'Theme presets you can import and share'],
  },
  {
    id: 'privacy',
    label: 'Privacy & security',
    icon: 'lock',
    planned: true,
    Component: ComingSoonSection,
    title: 'Privacy & security',
    summary: 'Transparent controls over everything Luma stores or sends.',
    bullets: ['A plain-language view of every permission', 'Local data inspection and cleanup tools', 'Optional encryption for stored data'],
  },
];
