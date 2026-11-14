import { useCallback, useEffect, useMemo, useState } from 'react';
import { cx } from '../../lib/utils';
import { friendlyMessage } from '../../services/apiClient';
import {
  integrationService,
  type IntegrationInfo,
  type IntegrationStatus,
} from '../../services/integrationService';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { PlugIcon } from '../icons';
import { StatusNote, Spinner } from './StatusNote';

const STATUS_META: Record<
  IntegrationStatus,
  { label: string; tone: 'ok' | 'muted' | 'warn' | 'danger' | 'info' }
> = {
  connected: { label: 'Connected', tone: 'ok' },
  disconnected: { label: 'Not connected', tone: 'muted' },
  needs_credentials: { label: 'Setup needed', tone: 'warn' },
  expired: { label: 'Needs reconnect', tone: 'warn' },
  error: { label: 'Needs attention', tone: 'danger' },
  unavailable: { label: 'Not available yet', tone: 'muted' },
  not_required: { label: 'No connection needed', tone: 'info' },
};

export function IntegrationsSection() {
  const [items, setItems] = useState<IntegrationInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDisconnect, setPendingDisconnect] = useState<IntegrationInfo | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const payload = await integrationService.list();
      setItems(payload.integrations);
    } catch (cause) {
      setError(friendlyMessage(cause));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => {
    const map = new Map<string, IntegrationInfo[]>();
    for (const item of items ?? []) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, [items]);

  const connect = async (item: IntegrationInfo) => {
    setBusyId(item.id);
    setError(null);
    setMessage(null);

    try {
      const result = await integrationService.connect(item.id);
      if (result.authorizeUrl) {
        window.open(result.authorizeUrl, '_blank', 'noopener,noreferrer');
        setMessage(
          `Finish connecting ${item.name} in the new tab, then check the status here. Luma never asks for that account’s password.`,
        );
      } else {
        await load();
        setMessage(`${item.name} is connected.`);
      }
    } catch (cause) {
      setError(friendlyMessage(cause));
    } finally {
      setBusyId(null);
    }
  };

  const disconnect = async (item: IntegrationInfo) => {
    setBusyId(item.id);
    setError(null);
    setMessage(null);

    try {
      await integrationService.disconnect(item.id);
      await load();
      setMessage(`${item.name} disconnected. Its access was revoked for this account.`);
    } catch (cause) {
      setError(friendlyMessage(cause));
    } finally {
      setBusyId(null);
      setPendingDisconnect(null);
    }
  };

  return (
    <section className="account-section" aria-labelledby="account-integrations">
      <div>
        <h3 className="settings__section-title" id="account-integrations">
          Integrations
        </h3>
        <p className="settings__section-intro">
          Connect services one at a time. Each one asks only for what it needs, and you can
          disconnect at any moment.
        </p>
      </div>

      {error ? (
        <StatusNote
          tone="error"
          action={
            <Button size="sm" onClick={() => void load()}>
              Try again
            </Button>
          }
        >
          {error}
        </StatusNote>
      ) : null}
      {message ? <StatusNote tone="info">{message}</StatusNote> : null}

      {items === null ? (
        <Spinner label="Loading integrations…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<PlugIcon size={20} />}
          title="No integrations available"
          text="Nothing could be loaded right now. Try again in a moment."
        />
      ) : (
        groups.map(([category, group]) => (
          <div className="settings__group" key={category}>
            <p className="settings__group-title">{category}</p>
            <div className="integration-list">
              {group.map((item) => {
                const meta = STATUS_META[item.status];
                const busy = busyId === item.id;

                return (
                  <article className="integration-card" key={item.id}>
                    <div className="integration-card__head">
                      <div className="integration-card__identity">
                        <span className="integration-card__name">{item.name}</span>
                        <span className="integration-card__summary">{item.summary}</span>
                      </div>
                      <span className={cx('status-pill', `status-pill--${meta.tone}`)}>
                        {meta.label}
                      </span>
                    </div>

                    <p className="integration-card__permissions">{item.permissions}</p>

                    {item.status === 'needs_credentials' ? (
                      <p className="integration-card__note">
                        Luma has no OAuth app for this service yet, so the button stays off
                        instead of pretending to connect. Setup: {item.env?.join(', ') || 'credentials'}.
                      </p>
                    ) : null}
                    {item.status === 'unavailable' ? (
                      <p className="integration-card__note">{item.reason}</p>
                    ) : null}
                    {item.status === 'error' ? (
                      <p className="integration-card__note">
                        {item.message ?? 'The last request failed.'} Reconnect to try again.
                      </p>
                    ) : null}
                    {item.status === 'expired' ? (
                      <p className="integration-card__note">
                        Access expired. Reconnect to renew it.
                      </p>
                    ) : null}

                    <div className="integration-card__actions">
                      {item.status === 'connected' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => setPendingDisconnect(item)}
                        >
                          {busy ? 'Working…' : 'Disconnect'}
                        </Button>
                      ) : null}

                      {item.status === 'disconnected' ||
                      item.status === 'expired' ||
                      item.status === 'error' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={busy}
                          onClick={() => void connect(item)}
                        >
                          {busy
                            ? 'Opening…'
                            : item.status === 'disconnected'
                              ? 'Connect'
                              : 'Reconnect'}
                        </Button>
                      ) : null}

                      {item.status === 'needs_credentials' ? (
                        <Button size="sm" variant="secondary" disabled>
                          Not configured
                        </Button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))
      )}

      <ConfirmDialog
        open={pendingDisconnect !== null}
        title="Disconnect this service?"
        description={`${pendingDisconnect?.name ?? 'This service'} will lose access to your account. Anything Luma already shows from it stops updating.`}
        confirmLabel="Disconnect"
        onConfirm={() => {
          if (pendingDisconnect) void disconnect(pendingDisconnect);
        }}
        onClose={() => setPendingDisconnect(null)}
      />
    </section>
  );
}
