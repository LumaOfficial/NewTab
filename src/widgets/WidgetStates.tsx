import type { ReactNode } from 'react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { InfoIcon, LockIcon, PlugIcon, WifiIcon } from '../components/icons';
import { useOnline } from './hooks';

export interface WidgetSetupStateProps {
  title: string;
  text: string;
  action?: ReactNode;
  icon?: ReactNode;
}

/** Shared "nothing is connected yet" state. Never shows placeholder data. */
export function WidgetSetupState({ title, text, action, icon }: WidgetSetupStateProps) {
  return <EmptyState icon={icon ?? <PlugIcon size={20} />} title={title} text={text} action={action} />;
}

export interface IntegrationSetupProps {
  service: string;
  text: string;
  onOpenIntegrations: () => void;
}

export function IntegrationSetup({ service, text, onOpenIntegrations }: IntegrationSetupProps) {
  const online = useOnline();
  if (!online) return <OfflineState />;

  return (
    <WidgetSetupState
      title={`${service} isn’t connected`}
      text={text}
      action={
        <Button variant="secondary" size="sm" onClick={onOpenIntegrations}>
          Open integrations
        </Button>
      }
    />
  );
}

export interface PermissionStateProps {
  permission: string;
  onOpenSettings: () => void;
}

export function PermissionState({ permission, onOpenSettings }: PermissionStateProps) {
  return (
    <WidgetSetupState
      icon={<LockIcon size={20} />}
      title="Needs an extension permission"
      text={`Reading ${permission} requires the “${permission}” permission. Luma only asks for permissions a feature actually uses, and this build requests storage alone — so nothing is read here until you enable it in the installed extension.`}
      action={
        <Button variant="ghost" size="sm" onClick={onOpenSettings}>
          About permissions
        </Button>
      }
    />
  );
}

export function OfflineState() {
  return (
    <WidgetSetupState
      icon={<WifiIcon size={20} />}
      title="You’re offline"
      text="This widget needs a connection. Everything saved locally still works."
    />
  );
}

export function WidgetErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <WidgetSetupState
      icon={<InfoIcon size={20} />}
      title="This widget couldn’t load"
      text="The rest of your dashboard is unaffected. Retrying only reloads this widget."
      action={
        onRetry ? (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}

export function WidgetLoading() {
  return (
    <div className="widget-loading" role="status">
      <span className="widget-loading__dot" />
      <span className="widget-loading__dot" />
      <span className="widget-loading__dot" />
      <span className="visually-hidden">Loading widget</span>
    </div>
  );
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'The site';
  }
}

export function EmbedFallback({ url }: { url: string }) {
  return (
    <WidgetSetupState
      icon={<InfoIcon size={20} />}
      title="This page can’t be embedded"
      text={`${safeHostname(url)} blocks being shown inside another page. Open it directly instead.`}
    />
  );
}
