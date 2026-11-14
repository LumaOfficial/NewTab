/**
 * OAuth callback + social sign-in start.
 *
 * Both paths are inert until the operator supplies client credentials for a
 * provider: without them the routes answer 501 `needs_credentials`, and the UI
 * says exactly that instead of pretending a connection exists.
 */
import { Router } from 'express';
import { config } from '../config.js';
import { db, save } from '../store.js';
import { credentialsFor, oauthEndpoints, socialProvider } from '../catalog.js';
import { encryptSecret, normalizeEmail, randomToken } from '../security.js';
import { clearSessionCookie, createSession, setSessionCookie } from '../session.js';
import { defaultSyncRecord } from '../syncState.js';

export const oauthRouter = Router();

function appTarget(req, stored) {
  return stored?.returnTo || req.get('origin') || config.appUrls[0] || '/';
}

function redirectWith(res, target, params) {
  let url;
  try {
    url = new URL(target);
  } catch {
    url = new URL('/', 'https://luma.local');
  }

  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  res.redirect(`${url.pathname}${url.search}${url.hash}` || '/');
}

function consumeState(state) {
  if (typeof state !== 'string') return null;
  const entry = db().oauthStates[state];
  if (!entry) return null;
  if (Date.now() - entry.createdAt > 10 * 60 * 1000) {
    delete db().oauthStates[state];
    return null;
  }
  return entry;
}

async function exchangeCode(providerId, code, redirectUri) {
  const credentials = credentialsFor(providerId);
  const endpoints = oauthEndpoints(providerId);
  if (!credentials?.configured || !endpoints?.tokenUrl) return null;

  const body = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  let response;
  try {
    response = await fetch(endpoints.tokenUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: body.toString(),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;
  const payload = await response.json().catch(() => null);
  if (!payload?.access_token) return null;

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    expiresIn: Number(payload.expires_in ?? 0) || null,
    scope: payload.scope ?? null,
  };
}

async function fetchAccountLabel(providerId, accessToken) {
  const endpoints = oauthEndpoints(providerId);
  if (!endpoints?.userInfoUrl) return null;

  try {
    const response = await fetch(endpoints.userInfoUrl, {
      headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
    });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null);
    return payload?.email ?? payload?.display_name ?? payload?.name ?? payload?.id ?? null;
  } catch {
    return null;
  }
}

function storeTokens(userId, integrationId, tokens, accountLabel) {
  const state = db();
  state.integrations[userId] ??= {};
  state.integrations[userId][integrationId] = {
    status: 'connected',
    connectedAt: Date.now(),
    accountLabel,
    accessToken: encryptSecret(tokens.accessToken),
    refreshToken: tokens.refreshToken ? encryptSecret(tokens.refreshToken) : null,
    expiresAt: tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : null,
    scope: tokens.scope,
  };
}

/** Social sign-in: hands the browser back a provider URL, never a secret. */
oauthRouter.post('/:provider/start', (req, res) => {
  const provider = socialProvider(req.params.provider);
  if (!provider) {
    return res.status(404).json({ error: { code: 'unknown_provider', message: 'Unknown provider.' } });
  }

  const credentials = credentialsFor(provider.id);
  if (!credentials.configured) {
    return res.status(501).json({
      error: {
        code: 'needs_credentials',
        message: `${provider.label} sign-in is not configured yet. Luma needs its own OAuth client for ${provider.label} before it can ask you to sign in.`,
        env: credentials.env,
      },
    });
  }

  if (provider.id === 'apple') {
    return res.status(501).json({
      error: {
        code: 'needs_credentials',
        message:
          'Apple sign-in needs a Services ID and a signing key issued by Apple before it can be enabled.',
        env: credentials.env,
      },
    });
  }

  const state = randomToken(16);
  db().oauthStates[state] = {
    provider: provider.id,
    mode: 'login',
    returnTo: req.get('origin') ?? null,
    createdAt: Date.now(),
  };
  void save();

  const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/${provider.id}/callback`;
  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: provider.scope,
    state,
    prompt: 'select_account',
  });

  res.json({ authorizeUrl: `${provider.authorizeUrl}?${params.toString()}` });
});

oauthRouter.get('/:provider/callback', async (req, res) => {
  const state = consumeState(req.query.state);
  const fallback = req.get('origin') || config.appUrls[0] || '/';

  if (!state || state.provider !== req.params.provider) {
    return redirectWith(res, fallback, { oauth: 'error', reason: 'expired' });
  }

  if (typeof req.query.error === 'string') {
    void save();
    return redirectWith(res, appTarget(req, state), {
      oauth: 'denied',
      integration: state.integrationId ?? '',
    });
  }

  if (typeof req.query.code !== 'string') {
    return redirectWith(res, appTarget(req, state), { oauth: 'error', reason: 'missing_code' });
  }

  const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/${req.params.provider}/callback`;
  const tokens = await exchangeCode(req.params.provider, req.query.code, redirectUri);

  if (!tokens) {
    return redirectWith(res, appTarget(req, state), {
      oauth: 'error',
      reason: 'exchange_failed',
      integration: state.integrationId ?? '',
    });
  }

  const accountLabel = await fetchAccountLabel(req.params.provider, tokens.accessToken);

  if (state.mode === 'login') {
    const email = normalizeEmail(accountLabel ?? '');
    if (!email.includes('@')) {
      return redirectWith(res, appTarget(req, state), { oauth: 'error', reason: 'no_email' });
    }

    let user = db().users.find((entry) => entry.email === email);
    if (!user) {
      user = {
        id: `usr_${randomToken(6)}`,
        email,
        name: '',
        passwordHash: null,
        emailVerified: true,
        createdAt: Date.now(),
      };
      db().users.push(user);
      db().sync[user.id] = defaultSyncRecord();
    }

    const session = createSession(user.id, req);
    setSessionCookie(res, session.token, req);
    await save();

    return redirectWith(res, appTarget(req, state), { oauth: 'signed_in' });
  }

  if (!state.userId) {
    return redirectWith(res, appTarget(req, state), { oauth: 'error', reason: 'no_user' });
  }

  storeTokens(state.userId, state.integrationId, tokens, accountLabel);
  await save();

  return redirectWith(res, appTarget(req, state), {
    oauth: 'connected',
    integration: state.integrationId,
  });
});

oauthRouter.post('/sign-out', (req, res) => {
  clearSessionCookie(res, req);
  res.json({ ok: true });
});
