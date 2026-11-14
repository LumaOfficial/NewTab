import { useEffect, useMemo, useState } from 'react';
import { getWidget } from '../catalogue';
import {
  readBookmarks,
  readExtensions,
  readHistory,
  readOpenTabs,
  readRecentlyClosed,
  type BrowserLink,
  type BrowserTabLink,
} from '../../extension/browserApi';
import { BookmarkIcon, TabsIcon } from '../../components/icons';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Field';
import { WidgetCard } from '../WidgetCard';
import { PermissionState } from '../WidgetStates';
import type { WidgetProps } from '../types';

type LoadState<T> = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; items: T[] };

function useBrowserList<T>(loader: () => Promise<T[] | null>, deps: unknown[] = []) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void loader().then((items) => {
      if (cancelled) return;
      setState(items === null ? { status: 'missing' } : { status: 'ready', items });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

function LinkList({ items }: { items: BrowserLink[] }) {
  if (items.length === 0) {
    return <p className="widget-hint">Nothing here yet.</p>;
  }
  return (
    <ul className="link-list">
      {items.slice(0, 8).map((item) => (
        <li key={item.id} className="link-row">
          <a href={item.url} target="_blank" rel="noreferrer noopener" className="link-row__link">
            <span className="link-row__title">{item.title}</span>
            <span className="link-row__url">{new URL(item.url).hostname}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------- Bookmarks */

export function BookmarksWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const state = useBrowserList<BrowserLink>(readBookmarks);

  return (
    <WidgetCard title={descriptor?.title ?? 'Bookmarks'}>
      {state.status === 'missing' ? (
        <PermissionState permission="bookmarks" onOpenSettings={openSettings} />
      ) : state.status === 'loading' ? (
        <p className="widget-hint">Reading bookmarks…</p>
      ) : (
        <LinkList items={state.items} />
      )}
    </WidgetCard>
  );
}

/* ---------------------------------------------------------------- Recent visits */

export function RecentVisitsWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const state = useBrowserList<BrowserLink>(() => readHistory(12));

  return (
    <WidgetCard title={descriptor?.title ?? 'Recently visited'}>
      {state.status === 'missing' ? (
        <PermissionState permission="history" onOpenSettings={openSettings} />
      ) : state.status === 'loading' ? (
        <p className="widget-hint">Reading history…</p>
      ) : (
        <LinkList items={state.items} />
      )}
    </WidgetCard>
  );
}

/* --------------------------------------------------------------- Open tabs/search */

function TabList({ tabs }: { tabs: BrowserTabLink[] }) {
  if (tabs.length === 0) {
    return (
      <EmptyState
        icon={<TabsIcon size={20} />}
        title="No open tabs"
        text="Tabs you open appear here when Luma can read them."
      />
    );
  }
  return (
    <ul className="link-list">
      {tabs.slice(0, 10).map((tab) => (
        <li key={tab.id} className="link-row">
          <a href={tab.url} target="_blank" rel="noreferrer noopener" className="link-row__link">
            <span className="link-row__title">
              {tab.active ? <span className="dot" aria-label="Active tab" /> : null}
              {tab.title}
            </span>
            <span className="link-row__url">{new URL(tab.url).hostname}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function OpenTabsWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const state = useBrowserList<BrowserTabLink>(readOpenTabs);

  return (
    <WidgetCard title={descriptor?.title ?? 'Open tabs'}>
      {state.status === 'missing' ? (
        <PermissionState permission="tabs" onOpenSettings={openSettings} />
      ) : state.status === 'loading' ? (
        <p className="widget-hint">Reading tabs…</p>
      ) : (
        <TabList tabs={state.items} />
      )}
    </WidgetCard>
  );
}

export function TabSearchWidget({ openSettings }: WidgetProps) {
  const state = useBrowserList<BrowserTabLink>(readOpenTabs);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (state.status !== 'ready') return [];
    const term = query.trim().toLowerCase();
    if (!term) return state.items;
    return state.items.filter(
      (tab) => tab.title.toLowerCase().includes(term) || tab.url.toLowerCase().includes(term),
    );
  }, [query, state]);

  return (
    <WidgetCard title="Tab search">
      {state.status === 'missing' ? (
        <PermissionState permission="tabs" onOpenSettings={openSettings} />
      ) : state.status === 'loading' ? (
        <p className="widget-hint">Reading tabs…</p>
      ) : (
        <>
          <Input
            type="search"
            value={query}
            placeholder="Find an open tab…"
            aria-label="Search open tabs"
            onChange={(event) => setQuery(event.target.value)}
          />
          <TabList tabs={filtered} />
        </>
      )}
    </WidgetCard>
  );
}

/* ------------------------------------------------------------ Closed tabs/sessions */

export function ClosedTabsWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const state = useBrowserList<BrowserLink>(readRecentlyClosed);

  return (
    <WidgetCard title={descriptor?.title ?? 'Recently closed'}>
      {state.status === 'missing' ? (
        <PermissionState permission="sessions" onOpenSettings={openSettings} />
      ) : state.status === 'loading' ? (
        <p className="widget-hint">Reading your session…</p>
      ) : state.items.length === 0 ? (
        <EmptyState
          icon={<TabsIcon size={20} />}
          title="Nothing closed recently"
          text="Closed tabs you can reopen will appear here."
        />
      ) : (
        <LinkList items={state.items} />
      )}
    </WidgetCard>
  );
}

export function SavedSessionsWidget({ openSettings }: WidgetProps) {
  return (
    <WidgetCard title="Saved sessions">
      <PermissionState permission="tabs" onOpenSettings={openSettings} />
    </WidgetCard>
  );
}

export function ExtensionsWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const state = useBrowserList<BrowserLink>(readExtensions);

  return (
    <WidgetCard title={descriptor?.title ?? 'Installed extensions'}>
      {state.status === 'missing' ? (
        <PermissionState permission="sessions" onOpenSettings={openSettings} />
      ) : state.status === 'loading' ? (
        <p className="widget-hint">Reading extensions…</p>
      ) : state.items.length === 0 ? (
        <p className="widget-hint">No enabled extensions were reported.</p>
      ) : (
        <ul className="extension-grid">
          {state.items.slice(0, 8).map((extension) => (
            <li key={extension.id} className="extension-chip">
              {extension.url ? (
                <img src={extension.url} alt="" width={20} height={20} />
              ) : (
                <BookmarkIcon size={16} />
              )}
              <span>{extension.title}</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
