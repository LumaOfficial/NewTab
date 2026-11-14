import { Router } from 'express';
import { db, save } from '../store.js';
import { requireUser } from '../session.js';
import {
  defaultSyncRecord,
  normalizeSyncSettings,
  SYNC_CATEGORY_IDS,
} from '../syncState.js';

export const syncRouter = Router();

syncRouter.use(requireUser);

function recordFor(userId) {
  const state = db();
  if (!state.sync[userId]) state.sync[userId] = defaultSyncRecord();
  return state.sync[userId];
}

function indexOf(record) {
  const categories = {};
  for (const [id, entry] of Object.entries(record.categories)) {
    categories[id] = { version: entry.version, updatedAt: entry.updatedAt };
  }
  return categories;
}

syncRouter.get('/', (req, res) => {
  const record = recordFor(req.user.id);
  res.json({
    settings: record.settings,
    lastSyncedAt: record.lastSyncedAt,
    categories: indexOf(record),
  });
});

syncRouter.get('/:category', (req, res) => {
  const { category } = req.params;
  if (!SYNC_CATEGORY_IDS.includes(category)) {
    return res.status(404).json({ error: { code: 'unknown_category', message: 'Unknown sync category.' } });
  }

  const entry = recordFor(req.user.id).categories[category];
  res.json({
    category,
    version: entry?.version ?? 0,
    updatedAt: entry?.updatedAt ?? 0,
    data: entry?.data ?? null,
  });
});

/**
 * Push one category. `baseVersion` is the version the client last saw; a
 * mismatch means someone else wrote first, and the client must resolve it
 * instead of silently overwriting newer data.
 */
syncRouter.put('/:category', async (req, res) => {
  const { category } = req.params;
  if (!SYNC_CATEGORY_IDS.includes(category)) {
    return res.status(404).json({ error: { code: 'unknown_category', message: 'Unknown sync category.' } });
  }

  const record = recordFor(req.user.id);
  const current = record.categories[category];
  const currentVersion = current?.version ?? 0;
  const baseVersion = Number(req.body?.baseVersion ?? 0);

  if (!Number.isFinite(baseVersion) || baseVersion !== currentVersion) {
    return res.status(409).json({
      error: {
        code: 'sync_conflict',
        message: 'This category changed on another device since you last synced.',
      },
      remote: {
        category,
        version: currentVersion,
        updatedAt: current?.updatedAt ?? 0,
        data: current?.data ?? null,
      },
    });
  }

  const updatedAt = Date.now();
  record.categories[category] = {
    data: req.body?.data ?? null,
    version: currentVersion + 1,
    updatedAt,
    deviceId: req.session.deviceId,
  };
  record.lastSyncedAt = updatedAt;
  await save();

  res.json({ category, version: currentVersion + 1, updatedAt });
});

syncRouter.put('/', async (req, res) => {
  const record = recordFor(req.user.id);
  record.settings = normalizeSyncSettings(req.body, record.settings);
  await save();
  res.json({ settings: record.settings });
});
