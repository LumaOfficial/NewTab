import { useEffect, useState } from 'react';
import { getWidget } from '../catalogue';
import { readOpenTabs } from '../../extension/browserApi';
import { WidgetCard } from '../WidgetCard';
import { PermissionState, WidgetSetupState } from '../WidgetStates';
import { Button } from '../../components/ui/Button';
import { BatteryIcon, LockIcon, WifiIcon } from '../../components/icons';
import { useOnline } from '../hooks';
import type { WidgetProps } from '../types';

const PERMISSION_COPY: Record<string, { permission: string; title: string; text: string }> = {
  downloads: {
    permission: 'downloads',
    title: 'Downloads need permission',
    text: 'Showing recent downloads requires the “downloads” permission. This build requests only storage, so the list stays empty until the installed extension adds it.',
  },
  'tab-cleanup': {
    permission: 'tabs',
    title: 'Tab cleanup needs permission',
    text: 'Closing tabs requires the “tabs” permission, which this build does not request. Nothing is closed automatically.',
  },
  'duplicate-tabs': {
    permission: 'tabs',
    title: 'Duplicate detection needs permission',
    text: 'Comparing open tabs requires the “tabs” permission. Without it Luma cannot see your tabs at all.',
  },
};

export function BrowserPermissionWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const copy = PERMISSION_COPY[widgetId];

  return (
    <WidgetCard title={descriptor?.title ?? 'Browser widget'}>
      <WidgetSetupState
        icon={<LockIcon size={20} />}
        title={copy?.title ?? 'Needs a permission'}
        text={copy?.text ?? 'This widget needs an extension permission that this build does not request.'}
        action={
          <Button variant="ghost" size="sm" onClick={openSettings}>
            About permissions
          </Button>
        }
      />
    </WidgetCard>
  );
}

/* --------------------------------------------------- Duplicate tabs (real, if allowed) */

export function DuplicateTabsWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const [state, setState] = useState<'loading' | 'missing' | 'ready'>('loading');
  const [duplicates, setDuplicates] = useState<Array<{ url: string; count: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    void readOpenTabs().then((tabs) => {
      if (cancelled) return;
      if (tabs === null) {
        setState('missing');
        return;
      }
      const counts = new Map<string, number>();
      for (const tab of tabs) counts.set(tab.url, (counts.get(tab.url) ?? 0) + 1);
      setDuplicates(
        Array.from(counts.entries())
          .filter(([, count]) => count > 1)
          .map(([url, count]) => ({ url, count })),
      );
      setState('ready');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WidgetCard title={descriptor?.title ?? 'Duplicate tabs'}>
      {state === 'missing' ? (
        <PermissionState permission="tabs" onOpenSettings={openSettings} />
      ) : state === 'loading' ? (
        <p className="widget-hint">Comparing tabs…</p>
      ) : duplicates.length === 0 ? (
        <p className="widget-hint">No duplicate tabs found. Nothing to clean up.</p>
      ) : (
        <ul className="link-list">
          {duplicates.map((duplicate) => (
            <li key={duplicate.url} className="link-row">
              <span className="link-row__title">{new URL(duplicate.url).hostname}</span>
              <span className="link-row__url">{duplicate.count} copies open</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

/* --------------------------------------------------------------- Browser settings */

const SETTINGS_LINKS = [
  { label: 'Privacy & security', address: 'opera://settings/privacy' },
  { label: 'Extensions', address: 'opera://extensions' },
  { label: 'Downloads', address: 'opera://downloads' },
  { label: 'Search engines', address: 'opera://settings/searchEngines' },
];

export function BrowserSettingsWidget({ widgetId }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  const copy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setError('');
    } catch {
      setError('Copying was blocked. Select the address and copy it manually.');
    }
  };

  return (
    <WidgetCard title={descriptor?.title ?? 'Browser shortcuts'}>
      <ul className="link-list">
        {SETTINGS_LINKS.map((link) => (
          <li key={link.address} className="link-row">
            <span className="link-row__title">{link.label}</span>
            <button
              type="button"
              className="link-row__copy"
              onClick={() => void copy(link.address)}
              aria-label={`Copy ${link.address}`}
            >
              {copied === link.address ? 'Copied' : 'Copy address'}
            </button>
          </li>
        ))}
      </ul>
      {error ? <p className="widget-hint">{error}</p> : null}
      <p className="widget-hint">
        Browsers block pages from opening their own settings, so paste the copied address into a new
        tab.
      </p>
    </WidgetCard>
  );
}

/* ---------------------------------------------------------------------- Incognito */

export function IncognitoWidget({ widgetId }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  return (
    <WidgetCard title={descriptor?.title ?? 'Incognito'}>
      <WidgetSetupState
        icon={<LockIcon size={20} />}
        title="Open a private window"
        text="A page cannot open a private window on your behalf. In Opera use Ctrl+Shift+N (⌘+Shift+N on macOS), or the menu → New private window."
      />
    </WidgetCard>
  );
}

/* ------------------------------------------------------------------------ Battery */

interface BatteryState {
  level: number;
  charging: boolean;
}

interface BatteryManagerLike {
  level: number;
  charging: boolean;
  addEventListener(type: 'levelchange' | 'chargingchange', listener: () => void): void;
  removeEventListener(type: 'levelchange' | 'chargingchange', listener: () => void): void;
}

export function BatteryWidget({ widgetId }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const [battery, setBattery] = useState<BatteryState | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const getBattery = (
      navigator as Navigator & { getBattery?: () => Promise<BatteryManagerLike> }
    ).getBattery;

    if (typeof getBattery !== 'function') {
      setUnavailable(true);
      return undefined;
    }

    let manager: BatteryManagerLike | null = null;
    let cancelled = false;
    const update = () => {
      if (manager && !cancelled) {
        setBattery({ level: Math.round(manager.level * 100), charging: manager.charging });
      }
    };

    void getBattery()
      .then((value) => {
        if (cancelled) return;
        manager = value;
        update();
        value.addEventListener('levelchange', update);
        value.addEventListener('chargingchange', update);
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
      manager?.removeEventListener('levelchange', update);
      manager?.removeEventListener('chargingchange', update);
    };
  }, []);

  return (
    <WidgetCard title={descriptor?.title ?? 'Battery'}>
      {unavailable ? (
        <WidgetSetupState
          icon={<BatteryIcon size={20} />}
          title="Battery not available"
          text="This browser doesn’t expose battery information."
        />
      ) : battery ? (
        <div className="status-widget">
          <span className="status-widget__value">{battery.level}%</span>
          <span className="status-widget__meta">{battery.charging ? 'Charging' : 'On battery'}</span>
        </div>
      ) : (
        <p className="widget-hint">Reading battery…</p>
      )}
    </WidgetCard>
  );
}

/* ------------------------------------------------------------------------ Network */

interface NetworkInformationLike {
  effectiveType?: string;
  downlink?: number;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
}

export function NetworkWidget({ widgetId }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const online = useOnline();
  const [info, setInfo] = useState<{ effectiveType?: string; downlink?: number }>({});

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: NetworkInformationLike }
    ).connection;
    if (!connection) return undefined;

    const update = () =>
      setInfo({ effectiveType: connection.effectiveType, downlink: connection.downlink });
    update();
    connection.addEventListener?.('change', update);
    return () => connection.removeEventListener?.('change', update);
  }, []);

  return (
    <WidgetCard title={descriptor?.title ?? 'Network'}>
      <div className="status-widget">
        <WifiIcon size={18} />
        <span className="status-widget__value">{online ? 'Online' : 'Offline'}</span>
        <span className="status-widget__meta">
          {online
            ? [info.effectiveType?.toUpperCase(), info.downlink ? `${info.downlink} Mb/s` : '']
                .filter(Boolean)
                .join(' · ') || 'Connection details unavailable'
            : 'Showing saved content'}
        </span>
      </div>
    </WidgetCard>
  );
}
