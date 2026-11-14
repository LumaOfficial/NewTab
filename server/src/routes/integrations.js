import { Router } from 'express';
import { db, save } from '../store.js';
import { requireUser } from '../session.js';
import { credentialsFor, INTEGRATIONS, integration, oauthEndpoints } from '../catalog.js';
import { encryptSecret, randomToken } from '../security.js';

export const integrationsRouter = Router();

function recordFor(userId) {
  const state = db();
  if (!state.integrations[userId]) state.integrations[userId] = {};
  return state.integrations[userId];
}

export function describeIntegration(entry, record) {
  const base = {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    kind: entry.kind,
    scopes: entry.scopes ?? [],
    permissions: entry.permissions,
    summary: entry.summary,
  };

  if (entry.kind === 'links') return { ...base, status: 'not_required' };
  if (entry.kind === 'browser') {
    return { ...base, status: 'unavailable', reason: entry.unavailableReason };
  }

  if (entry.kind === 'api-key') {
    const configured = (entry.env ?? []).every((name) => Boolean(process.env[name]));
    if (!configured) return { ...base, status: 'needs_credentials', env: entry.env };
    return record
      ? { ...base, status: 'connected', connectedAt: record.connectedAt ?? null }
      : { ...base, status: 'disconnected' };
  }

  const credentials = credentialsFor(entry.oauth);
  if (!credentials.configured) {
    return { ...base, status: 'needs_credentials', env: credentials.env };
  }
  if (!record) return { ...base, status: 'disconnected' };
  if (record.status === 'error') {
    return { ...base, status: 'error', message: record.message ?? 'The last request failed.' };
  }
  if (record.expiresAt && record.expiresAt < Date.now()) {
    return { ...base, status: 'expired', connectedAt: record.connectedAt ?? null };
  }
  return {
    ...base,
    status: 'connected',
    connectedAt: record.connectedAt ?? null,
    accountLabel: record.accountLabel ?? null,
  };
}

integrationsRouter.get('/', requireUser, (req, res) => {
  const records = recordFor(req.user.id);
  res.json({
    integrations: INTEGRATIONS.map((entry) => describeIntegration(entry, records[entry.id])),
  });
});

/** Returns an authorization URL. Credentials are never sent to the browser. */
integrationsRouter.post('/:id/connect', requireUser, (req, res) => {
  const entry = integration(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: { code: 'unknown_integration', message: 'Unknown integration.' } });
  }

  if (entry.kind === 'browser' || entry.kind === 'links') {
    return res.status(409).json({
      error: {
        code: 'not_connectable',
        message: entry.unavailableReason ?? 'This integration does not need a connection.',
      },
    });
  }

  if (entry.kind === 'api-key') {
    const configured = (entry.env ?? []).every((name) => Boolean(process.env[name]));
    if (!configured) {
      return res.status(501).json({
        error: {
          code: 'needs_credentials',
          message: `${entry.name} needs a service key before it can be connected.`,
          env: entry.env,
        },
      });
    }

    const records = recordFor(req.user.id);
    records[entry.id] = { status: 'connected', connectedAt: Date.now() };
    void save();
    return res.json({ status: 'connected' });
  }

  const credentials = credentialsFor(entry.oauth);
  if (!credentials.configured) {
    return res.status(501).json({
      error: {
        code: 'needs_credentials',
        message: `${entry.name} is not connected to Luma yet: the app needs its own OAuth client before it can ask you for permission.`,
        env: credentials.env,
      },
    });
  }

  const endpoints = oauthEndpoints(entry.oauth);
  const state = randomToken(16);
  db().oauthStates[state] = {
    provider: entry.oauth,
    integrationId: entry.id,
    userId: req.user.id,
    returnTo: req.get('origin') ?? null,
    createdAt: Date.now(),
  };
  void save();

  const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/${entry.oauth}/callback`;
  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: (entry.scopes ?? []).join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  res.json({ authorizeUrl: `${endpoints.authorizeUrl}?${params.toString()}` });
});

integrationsRouter.delete('/:id', requireUser, async (req, res) => {
  const records = recordFor(req.user.id);
  if (!records[req.params.id]) {
    return res.status(404).json({
      error: { code: 'not_connected', message: 'That integration is not connected.' },
    });
  }

  delete records[req.params.id];
  await save();
  res.json({ ok: true });
});

/** Marks a connection as needing attention after a failed refresh. */
integrationsRouter.post('/:id/refresh', requireUser, async (req, res) => {
  const entry = integration(req.params.id);
  const records = recordFor(req.user.id);
  const record = records[req.params.id];

  if (!entry || !record) {
    return res.status(404).json({
      error: { code: 'not_connected', message: 'That integration is not connected.' },
    });
  }

  if (!record.refreshToken) {
    record.status = 'error';
    record.message = 'The service needs you to sign in again.';
    await save();
    return res.status(409).json({
      error: { code: 'reauth_required', message: 'Reconnect this integration to continue.' },
    });
  }

  // A real refresh call is provider-specific; the token exchange lives here so
  // each provider can be added without touching the rest of the app.
  const encrypted = encryptSecret(record.refreshToken);
  if (!encrypted) {
    return res.status(500).json({
      error: { code: 'storage_unavailable', message: 'Token storage is not configured.' },
    });
  }

  res.status(501).json({
    error: {
      code: 'refresh_not_implemented',
      message: 'Token refresh for this provider is not implemented yet. Reconnect to continue.',
    },
  });
});
