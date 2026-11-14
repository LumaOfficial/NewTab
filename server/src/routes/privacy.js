import { Router } from 'express';
import { db, save } from '../store.js';
import { requireUser, revokeAllSessions, clearSessionCookie } from '../session.js';
import { publicUser } from './auth.js';

export const privacyRouter = Router();

privacyRouter.use(requireUser);

/** Everything Luma holds for this account, minus anything secret. */
privacyRouter.get('/export', (req, res) => {
  const state = db();
  const sync = state.sync[req.user.id] ?? null;
  const integrations = state.integrations[req.user.id] ?? {};

  res.json({
    exportedAt: new Date().toISOString(),
    account: publicUser(req.user),
    sync: sync
      ? {
          settings: sync.settings,
          lastSyncedAt: sync.lastSyncedAt,
          categories: Object.fromEntries(
            Object.entries(sync.categories).map(([id, entry]) => [
              id,
              { version: entry.version, updatedAt: entry.updatedAt, data: entry.data },
            ]),
          ),
        }
      : null,
    integrations: Object.fromEntries(
      Object.entries(integrations).map(([id, entry]) => [
        id,
        {
          status: entry.status,
          connectedAt: entry.connectedAt ?? null,
          accountLabel: entry.accountLabel ?? null,
        },
      ]),
    ),
    devices: state.sessions
      .filter((session) => session.userId === req.user.id)
      .map((session) => ({
        label: session.deviceLabel,
        createdAt: session.createdAt,
        lastSeenAt: session.lastSeenAt,
      })),
    note: 'Integration access tokens are never included in exports.',
  });
});

privacyRouter.post('/delete-synced', async (req, res) => {
  const state = db();
  if (state.sync[req.user.id]) {
    state.sync[req.user.id].categories = {};
    state.sync[req.user.id].lastSyncedAt = 0;
  }
  await save();
  res.json({ ok: true });
});

privacyRouter.post('/disconnect-integrations', async (req, res) => {
  const state = db();
  state.integrations[req.user.id] = {};
  await save();
  res.json({ ok: true });
});

privacyRouter.delete('/', async (req, res) => {
  const state = db();
  const userId = req.user.id;
  const confirmation = String(req.body?.confirmation ?? '').trim().toLowerCase();

  if (confirmation !== 'delete') {
    return res.status(400).json({
      error: { code: 'confirmation_required', message: 'Type “delete” to confirm.' },
    });
  }

  if (req.user.passwordHash) {
    const { verifyPassword } = await import('../security.js');
    if (!(await verifyPassword(String(req.body?.password ?? ''), req.user.passwordHash))) {
      return res.status(401).json({
        error: { code: 'invalid_credentials', message: 'That password is not correct.' },
      });
    }
  }

  state.users = state.users.filter((entry) => entry.id !== userId);
  state.sessions = state.sessions.filter((entry) => entry.userId !== userId);
  delete state.sync[userId];
  delete state.integrations[userId];
  delete state.verification[userId];
  delete state.resets[userId];

  revokeAllSessions(userId);
  clearSessionCookie(res, req);
  await save();

  res.json({ ok: true });
});
