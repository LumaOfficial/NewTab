import type { ComponentType } from 'react';
import type { AccountView } from '../account/views';

/** Props every widget receives from the dashboard shell. */
export interface WidgetProps {
  /** Id of the widget being rendered (useful for shared generic widgets). */
  widgetId: string;
  /** Opens the settings drawer (used by widgets that point at settings). */
  openSettings: () => void;
  /** Opens the account panel on a specific view (integrations, sync…). */
  openAccount: (view?: AccountView) => void;
}

export type WidgetComponent = ComponentType<WidgetProps>;

export type WidgetComponentMap = Record<string, WidgetComponent>;
