/**
 * Thin, optional wrappers around Chromium extension APIs.
 *
 * The dashboard is a normal page in development, so every call here is
 * defensive: when the API or its permission is missing the promise resolves to
 * `null`, and the widget shows its honest setup state instead of fake data.
 */

interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

interface TabInfo {
  id?: number;
  title?: string;
  url?: string;
  active?: boolean;
  windowId?: number;
  lastAccessed?: number;
}

interface HistoryItem {
  title?: string;
  url?: string;
  lastVisitTime?: number;
}

interface SessionTab {
  title?: string;
  url?: string;
}

interface SessionInfo {
  tab?: SessionTab;
  window?: { tabs?: SessionTab[] };
}

interface ExtensionInfo {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  icons?: Array<{ url: string }>;
}

interface ChromeLike {
  bookmarks?: {
    getTree(callback: (nodes: BookmarkNode[]) => void): void;
  };
  tabs?: {
    query(info: Record<string, unknown>, callback: (tabs: TabInfo[]) => void): void;
  };
  history?: {
    search(
      query: { text?: string; maxResults?: number },
      callback: (items: HistoryItem[]) => void,
    ): void;
  };
  sessions?: {
    getRecentlyClosed(callback: (sessions: SessionInfo[]) => void): void;
  };
  management?: {
    getAll(callback: (extensions: ExtensionInfo[]) => void): void;
  };
}

export interface BrowserLink {
  id: string;
  title: string;
  url: string;
}

export interface BrowserTabLink extends BrowserLink {
  windowId: number;
  active: boolean;
}

function api(): ChromeLike | null {
  const chrome = (globalThis as { chrome?: ChromeLike }).chrome;
  return chrome && typeof chrome === 'object' ? chrome : null;
}

function safeUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

function flattenBookmarks(nodes: BookmarkNode[], depth = 0): BrowserLink[] {
  if (depth > 8) return [];
  return nodes.flatMap((node) => {
    const own = node.url ? safeUrl(node.url) : null;
    const link = own ? [{ id: node.id, title: node.title || own, url: own }] : [];
    const children = node.children ? flattenBookmarks(node.children, depth + 1) : [];
    return [...link, ...children];
  });
}

export function readBookmarks(): Promise<BrowserLink[] | null> {
  const chrome = api();
  if (!chrome?.bookmarks) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      chrome.bookmarks?.getTree((nodes) => {
        resolve(flattenBookmarks(nodes).slice(0, 40));
      });
    } catch {
      resolve(null);
    }
  });
}

export function readOpenTabs(): Promise<BrowserTabLink[] | null> {
  const chrome = api();
  if (!chrome?.tabs) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      chrome.tabs?.query({}, (tabs) => {
        resolve(
          tabs.flatMap((tab) => {
            const url = safeUrl(tab.url);
            if (!url) return [];
            return [
              {
                id: String(tab.id ?? url),
                title: tab.title || url,
                url,
                windowId: tab.windowId ?? 0,
                active: tab.active === true,
              },
            ];
          }),
        );
      });
    } catch {
      resolve(null);
    }
  });
}

export function readHistory(maxResults = 20): Promise<BrowserLink[] | null> {
  const chrome = api();
  if (!chrome?.history) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      chrome.history?.search({ maxResults }, (items) => {
        resolve(
          items.flatMap((item, index) => {
            const url = safeUrl(item.url);
            if (!url) return [];
            return [{ id: `history-${index}-${url}`, title: item.title || url, url }];
          }),
        );
      });
    } catch {
      resolve(null);
    }
  });
}

export function readRecentlyClosed(): Promise<BrowserLink[] | null> {
  const chrome = api();
  if (!chrome?.sessions) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      chrome.sessions?.getRecentlyClosed((sessions) => {
        const links = sessions.flatMap((session, index) => {
          const url = safeUrl(session.tab?.url);
          if (!url) return [];
          return [{ id: `session-${index}-${url}`, title: session.tab?.title || url, url }];
        });
        resolve(links);
      });
    } catch {
      resolve(null);
    }
  });
}

export function readExtensions(): Promise<BrowserLink[] | null> {
  const chrome = api();
  if (!chrome?.management) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      chrome.management?.getAll((extensions) => {
        resolve(
          extensions
            .filter((extension) => extension.enabled !== false)
            .map((extension) => ({
              id: extension.id,
              title: extension.name,
              url: extension.icons?.[0]?.url ?? '',
            })),
        );
      });
    } catch {
      resolve(null);
    }
  });
}
