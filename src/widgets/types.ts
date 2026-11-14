import type { ComponentType } from 'react';
import type { WidgetId } from './widgets';

/** Props every widget receives from the dashboard shell. */
export interface WidgetProps {
  /** Opens the settings drawer (used by widgets that point at settings). */
  openSettings: () => void;
}

export type WidgetComponent = ComponentType<WidgetProps>;

export type WidgetComponentMap = Record<WidgetId, WidgetComponent>;
