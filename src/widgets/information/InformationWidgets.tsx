import { useEffect, useState } from 'react';
import { getWidget, type WidgetIntegrationId } from '../catalogue';
import { readUrl } from '../../storage/schema';
import { WidgetCard } from '../WidgetCard';
import { IntegrationSetup, WidgetSetupState } from '../WidgetStates';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { CloudIcon, LayersIcon } from '../../components/icons';
import { useWidgetConfig } from '../hooks';
import type { WidgetProps } from '../types';

const COPY: Record<WidgetIntegrationId, string> = {
  weather:
    'Weather needs a weather service key on the Luma account server. Without it this widget stays empty rather than guessing.',
  news: 'Headlines appear here once a news service is connected on the account server.',
  rss: 'Add a feed URL in this widget’s settings.',
  stocks: 'Quotes need a market data connection. Luma never invents prices.',
  crypto: 'Coin prices need a market data connection.',
  sports: 'Scores need a sports data connection.',
  transit: 'Transit times need a transit service connection.',
  'google-calendar': 'Connect a calendar to see events.',
  'outlook-calendar': 'Connect a calendar to see events.',
  spotify: 'Connect Spotify to see media.',
  'youtube-music': 'Connect YouTube Music to see media.',
  'email-preview': 'Connect a mailbox to preview messages.',
  contacts: 'Connect contacts to see people.',
  messaging: 'Messaging apps open as links.',
};

export function InformationIntegrationWidget({ widgetId, openAccount, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const config = useWidgetConfig<{ location?: string; symbols?: string; coins?: string }>(widgetId);
  if (!descriptor) return null;
  const integration = descriptor.integration ?? 'news';

  if (integration === 'weather' && !String(config.location ?? '').trim()) {
    return (
      <WidgetCard title={descriptor.title}>
        <WidgetSetupState
          icon={<CloudIcon size={20} />}
          title="Choose a location"
          text="Add a city in this widget’s settings. Weather data itself still needs the weather service configured on the account server."
          action={
            <Button variant="ghost" size="sm" onClick={openSettings}>
              Widget settings
            </Button>
          }
        />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title={descriptor.title}>
      <IntegrationSetup
        service={descriptor.title}
        text={COPY[integration]}
        onOpenIntegrations={() => openAccount('integrations')}
      />
    </WidgetCard>
  );
}

/* --------------------------------------------------------------------- RSS feed */

interface FeedItem {
  title: string;
  link: string;
  published: string;
}

type FeedState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: FeedItem[] };

function parseFeed(xml: string): FeedItem[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('feed');

  const rssItems = Array.from(doc.querySelectorAll('item')).slice(0, 6);
  const atomItems = rssItems.length === 0 ? Array.from(doc.querySelectorAll('entry')).slice(0, 6) : [];

  const read = (element: Element, names: string[]): string =>
    names.map((name) => element.querySelector(name)?.textContent ?? '').find(Boolean) ?? '';

  return [...rssItems, ...atomItems].map((item) => ({
    title: read(item, ['title']) || 'Untitled item',
    link: read(item, ['link']).trim(),
    published: read(item, ['pubDate', 'published', 'updated']),
  }));
}

export function RssWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const config = useWidgetConfig<{ feedUrl: string }>(widgetId);
  const url = readUrl(String(config.feedUrl ?? ''));
  const [state, setState] = useState<FeedState>({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url) {
      setState({ status: 'idle' });
      return undefined;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    void (async () => {
      try {
        const response = await fetch(url, { credentials: 'omit' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const xml = await response.text();
        const items = parseFeed(xml);
        if (!cancelled) setState({ status: 'ready', items });
      } catch {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              'The feed could not be loaded. Many sites block reading a feed from another page, and the feed address may also be wrong.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, attempt]);

  return (
    <WidgetCard
      title={descriptor?.title ?? 'RSS feed'}
      actions={
        url ? (
          <Button variant="ghost" size="sm" onClick={() => setAttempt((value) => value + 1)}>
            Refresh
          </Button>
        ) : undefined
      }
    >
      {!url ? (
        <WidgetSetupState
          icon={<LayersIcon size={20} />}
          title="No feed yet"
          text="Add a feed URL in this widget’s settings. Luma reads it directly and never sends it anywhere else."
          action={
            <Button variant="ghost" size="sm" onClick={openSettings}>
              Widget settings
            </Button>
          }
        />
      ) : state.status === 'loading' ? (
        <p className="widget-hint">Loading feed…</p>
      ) : state.status === 'error' ? (
        <WidgetSetupState
          icon={<LayersIcon size={20} />}
          title="Feed unavailable"
          text={state.message}
          action={
            <Button variant="ghost" size="sm" onClick={() => setAttempt((value) => value + 1)}>
              Try again
            </Button>
          }
        />
      ) : state.status === 'ready' ? (
        state.items.length === 0 ? (
          <EmptyState title="The feed is empty" text="No items were found in that feed." />
        ) : (
          <ul className="link-list">
            {state.items.map((item) => (
              <li key={`${item.title}-${item.link}`} className="link-row">
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noreferrer noopener" className="link-row__link">
                    <span className="link-row__title">{item.title}</span>
                  </a>
                ) : (
                  <span className="link-row__title">{item.title}</span>
                )}
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="widget-hint">Add a feed URL in this widget’s settings.</p>
      )}
    </WidgetCard>
  );
}

/* ------------------------------------------------------------------ News search */

export function NewsWidget({ widgetId }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  return (
    <WidgetCard title={descriptor?.title ?? 'News'}>
      <div className="inline-form">
        <Input
          type="search"
          value=""
          placeholder="Search headlines when a news service is connected"
          aria-label="Search headlines"
          disabled
        />
        <Button variant="secondary" size="sm" disabled>
          Search
        </Button>
      </div>
      <WidgetSetupState
        title="No news service connected"
        text="News needs a connected service. The search box stays disabled until one exists, so nothing here is simulated."
      />
    </WidgetCard>
  );
}

