import { useState, type FormEvent } from 'react';
import { getWidget } from '../catalogue';
import { readUrl } from '../../storage/schema';
import { createId } from '../../lib/utils';
import { WidgetCard } from '../WidgetCard';
import { IntegrationSetup, WidgetSetupState } from '../WidgetStates';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { IconButton } from '../../components/ui/IconButton';
import { LinkIcon2, PlugIcon, TrashIcon } from '../../components/icons';
import { useWidgetConfig, useWidgetState } from '../hooks';
import type { WidgetProps } from '../types';

const PERSONAL_SERVICES: Record<string, string> = {
  'email-preview': 'email-preview',
  'unread-email': 'email-preview',
  contacts: 'contacts',
};

export function PersonalIntegrationWidget({ widgetId, openAccount }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  if (!descriptor) return null;
  const service = PERSONAL_SERVICES[widgetId] ?? 'email-preview';

  return (
    <WidgetCard title={descriptor.title}>
      <IntegrationSetup
        service={service === 'contacts' ? 'Contacts' : 'A mailbox'}
        text={
          service === 'contacts'
            ? 'Connect contacts in Integrations to see people here. Nothing is read until you connect.'
            : 'Connect a mailbox in Integrations to preview messages. Luma never invents an inbox.'
        }
        onOpenIntegrations={() => openAccount('integrations')}
      />
    </WidgetCard>
  );
}

/* -------------------------------------------------------------------- Messaging */

const MESSAGING_LINKS = [
  { label: 'WhatsApp', url: 'https://web.whatsapp.com/' },
  { label: 'Telegram', url: 'https://web.telegram.org/' },
  { label: 'Messenger', url: 'https://www.messenger.com/' },
  { label: 'Slack', url: 'https://app.slack.com/' },
  { label: 'Discord', url: 'https://discord.com/app' },
];

export function MessagingWidget({ widgetId }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  return (
    <WidgetCard title={descriptor?.title ?? 'Messaging'}>
      <ul className="chip-links">
        {MESSAGING_LINKS.map((link) => (
          <li key={link.label}>
            <a href={link.url} target="_blank" rel="noreferrer noopener" className="chip-link">
              {link.label}
              <LinkIcon2 size={13} />
            </a>
          </li>
        ))}
      </ul>
      <p className="widget-hint">Opens the app’s own website. No account is connected here.</p>
    </WidgetCard>
  );
}

/* -------------------------------------------------------------------- Embed */

export function EmbedWidget({ widgetId, openSettings }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const config = useWidgetConfig<{ url: string; title: string; height: number }>(widgetId);
  const url = readUrl(String(config.url ?? ''));
  const [failed, setFailed] = useState(false);
  const height = Math.min(640, Math.max(120, Number(config.height) || 260));

  return (
    <WidgetCard title={String(config.title || descriptor?.title || 'Custom embed')}>
      {!url ? (
        <WidgetSetupState
          icon={<PlugIcon size={20} />}
          title="No page embedded yet"
          text="Add an https address in this widget’s settings. Only embed pages you trust; some sites block being framed."
          action={
            <Button variant="ghost" size="sm" onClick={openSettings}>
              Widget settings
            </Button>
          }
        />
      ) : failed ? (
        <WidgetSetupState
          icon={<PlugIcon size={20} />}
          title="This page can’t be embedded"
          text={`${new URL(url).hostname} refused to load inside Luma. Open it in its own tab instead.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            >
              Open page
            </Button>
          }
        />
      ) : (
        <>
          <iframe
            className="embed-frame"
            src={url}
            title={String(config.title || 'Embedded page')}
            height={height}
            loading="lazy"
            sandbox="allow-scripts allow-forms allow-popups"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
          <p className="widget-hint">
            If the frame stays blank, the site blocks embedding.{' '}
            <a href={url} target="_blank" rel="noreferrer noopener">
              Open it directly
            </a>
            .
          </p>
        </>
      )}
    </WidgetCard>
  );
}

/* ----------------------------------------------------------------- Custom links */

interface CustomLink {
  id: string;
  title: string;
  url: string;
}

interface LinkState extends Record<string, unknown> {
  links: CustomLink[];
}

export function CustomLinksWidget({ widgetId }: WidgetProps) {
  const descriptor = getWidget(widgetId);
  const [state, setState] = useWidgetState<LinkState>('custom-links', { links: [] });
  const links = Array.isArray(state.links) ? state.links : [];
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safe = readUrl(url);
    if (!safe) return;
    setState({
      links: [...links, { id: createId('link'), title: title.trim() || new URL(safe).hostname, url: safe }],
    });
    setTitle('');
    setUrl('');
  };

  return (
    <WidgetCard title={descriptor?.title ?? 'Custom links'}>
      {links.length === 0 ? (
        <p className="widget-hint">Add a link you use often. Only http(s) addresses are accepted.</p>
      ) : (
        <ul className="link-list">
          {links.map((link) => (
            <li key={link.id} className="link-row">
              <a href={link.url} target="_blank" rel="noreferrer noopener" className="link-row__link">
                <span className="link-row__title">{link.title}</span>
                <span className="link-row__url">{new URL(link.url).hostname}</span>
              </a>
              <IconButton
                label={`Delete ${link.title}`}
                danger
                onClick={() => setState({ links: links.filter((entry) => entry.id !== link.id) })}
              >
                <TrashIcon size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <form className="inline-form inline-form--wrap" onSubmit={add}>
        <Input
          value={title}
          placeholder="Label"
          aria-label="Link label"
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          value={url}
          placeholder="https://…"
          aria-label="Link address"
          onChange={(event) => setUrl(event.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!readUrl(url)}>
          Add
        </Button>
      </form>
    </WidgetCard>
  );
}

