import { Component, type ErrorInfo, type ReactNode } from 'react';
import { WidgetErrorState } from './WidgetStates';

interface WidgetBoundaryProps {
  widgetId: string;
  children: ReactNode;
}

interface WidgetBoundaryState {
  failed: boolean;
}

/**
 * One broken widget never takes the dashboard down. Resetting the boundary
 * re-mounts only that widget.
 */
export class WidgetBoundary extends Component<WidgetBoundaryProps, WidgetBoundaryState> {
  state: WidgetBoundaryState = { failed: false };

  static getDerivedStateFromError(): WidgetBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the details in the console only; the user gets a calm message.
    console.error(`Luma widget "${this.props.widgetId}" failed`, error, info.componentStack);
  }

  componentDidUpdate(previous: WidgetBoundaryProps) {
    if (previous.widgetId !== this.props.widgetId && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return <WidgetErrorState onRetry={() => this.setState({ failed: false })} />;
    }
    return this.props.children;
  }
}
