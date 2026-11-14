import { useEffect, useState } from 'react';
import { useDashboard } from '../state/DashboardProvider';
import { getWidget } from './catalogue';

/** Read a widget's saved configuration, merged over its catalogue defaults. */
export function useWidgetConfig<T extends Record<string, unknown>>(widgetId: string): T {
  const { data } = useDashboard();
  const descriptor = getWidget(widgetId);
  return {
    ...(descriptor?.defaults ?? {}),
    ...(data.settings.widgetSettings[widgetId] ?? {}),
  } as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Read and write widget-owned state; the shape is validated by the widget. */
export function useWidgetState<T extends Record<string, unknown>>(
  widgetId: string,
  fallback: T,
): [T, (next: T) => void] {
  const { data, dispatch } = useDashboard();
  const raw = data.widgetState[widgetId];
  const value = isRecord(raw) ? ({ ...fallback, ...raw } as T) : fallback;

  return [
    value,
    (next: T) => dispatch({ type: 'widget/state', id: widgetId, value: next }),
  ];
}

/** A ticking clock shared by time widgets; pauses updates while hidden. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return online;
}

/** True when the app runs as an extension page with the given permission. */
export function useExtensionPermission(permission: string): 'granted' | 'missing' | 'unavailable' {
  const chromeApi = (
    globalThis as {
      chrome?: {
        permissions?: { contains: (query: { permissions?: string[] }, cb: (value: boolean) => void) => void };
      };
    }
  ).chrome;

  const [state, setState] = useState<'granted' | 'missing' | 'unavailable'>(
    chromeApi?.permissions ? 'missing' : 'unavailable',
  );

  useEffect(() => {
    if (!chromeApi?.permissions) return;
    try {
      chromeApi.permissions.contains({ permissions: [permission] }, (granted) => {
        setState(granted ? 'granted' : 'missing');
      });
    } catch {
      setState('missing');
    }
  }, [chromeApi, permission]);

  return state;
}
