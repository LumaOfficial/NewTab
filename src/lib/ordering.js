/** Reorder helpers shared by the widgets and shortcuts lists. */
export function moveById(list, id, delta, keyOf = (item) => (typeof item === 'string' ? item : item?.id)) {
  const index = list.findIndex((item) => keyOf(item) === id);
  if (index < 0) return list;

  const target = index + delta;
  if (target < 0 || target >= list.length) return list;

  const next = list.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}
