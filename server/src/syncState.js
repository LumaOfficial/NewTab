/** Categories that can be synchronised, and the shape of a sync record. */
export const SYNC_CATEGORY_IDS = [
  'appearance',
  'widgets',
  'shortcuts',
  'notes',
  'tasks',
  'settings',
];

export function defaultSyncRecord() {
  return {
    settings: {
      autoSync: true,
      categories: Object.fromEntries(SYNC_CATEGORY_IDS.map((id) => [id, true])),
    },
    categories: {},
    lastSyncedAt: 0,
  };
}

export function normalizeSyncSettings(value, current = defaultSyncRecord().settings) {
  const source = value && typeof value === 'object' ? value : {};
  const categories = {};

  for (const id of SYNC_CATEGORY_IDS) {
    const source_categories =
      source.categories && typeof source.categories === 'object' ? source.categories : {};
    categories[id] =
      typeof source_categories[id] === 'boolean'
        ? source_categories[id]
        : current.categories[id] !== false;
  }

  return {
    autoSync: typeof source.autoSync === 'boolean' ? source.autoSync : current.autoSync,
    categories,
  };
}
