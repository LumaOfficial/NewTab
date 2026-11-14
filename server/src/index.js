import express from 'express';
import { config } from './config.js';
import { load } from './store.js';
import { attachUser, pruneSessions } from './session.js';
import { authRouter } from './routes/auth.js';
import { syncRouter } from './routes/sync.js';
import { integrationsRouter } from './routes/integrations.js';
import { privacyRouter } from './routes/privacy.js';
import { oauthRouter } from './routes/oauth.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

/**
 * The extension build calls this API directly from its own origin; the preview
 * calls it through the dev server's proxy (same origin, no CORS involved).
 * Only explicitly allowed origins may read responses.
 */
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, X-Luma-Device-Id, X-Luma-Device-Label',
    );
    res.setHeader('Access-Control-Max-Age', '600');
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(attachUser);

/** Minimal in-memory throttle for credential endpoints. */
const attempts = new Map();
const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 40;

app.use(['/api/auth', '/api/oauth'], (req, res, next) => {
  if (req.method === 'GET' || req.path.startsWith('/session')) {
    next();
    return;
  }

  const key = `${req.ip}:${req.baseUrl}`;
  const now = Date.now();
  const entry = attempts.get(key);
  const count = entry && now - entry.startedAt < WINDOW_MS ? entry.count + 1 : 1;

  attempts.set(key, { startedAt: entry && now - entry.startedAt < WINDOW_MS ? entry.startedAt : now, count });

  if (count > LIMIT) {
    res.status(429).json({
      error: { code: 'rate_limited', message: 'Too many attempts. Wait a few minutes and try again.' },
    });
    return;
  }

  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'luma-account', time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/sync', syncRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/account', privacyRouter);
app.use('/api/oauth', oauthRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Unknown API route.' } });
});

app.use((error, _req, res, _next) => {
  console.error('[luma] request failed:', error?.message ?? error);
  res.status(500).json({
    error: { code: 'server_error', message: 'Something went wrong on Luma’s side. Try again.' },
  });
});

await load();
pruneSessions();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`[luma] account service listening on ${config.port}`);
});
