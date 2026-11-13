// Precomputed lookups so the focus filter never rescans the data on a click.
//
// Without an index, "which roles and projects match this focus area?" means scanning
// every item's area list: O(items x areas per item) for every click. Building one Map
// up front costs that same O(total tags) once. After that, each item's match test is a
// Set lookup, O(1), so re-rendering after a click is O(items).

export const ALL = 'all';

/**
 * @param {{ focusAreas: {id: string}[], skills: {id: string, areas: string[]}[],
 *           experience: {id: string, areas: string[]}[], projects: {id: string, areas: string[]}[] }} data
 * @returns {Map<string, {skills: Set<string>, experience: Set<string>, projects: Set<string>}>}
 */
export function buildAreaIndex(data) {
  const index = new Map();
  for (const area of data.focusAreas) {
    index.set(area.id, { skills: new Set(), experience: new Set(), projects: new Set() });
  }
  for (const kind of ['skills', 'experience', 'projects']) {
    for (const item of data[kind]) {
      for (const areaId of item.areas) {
        const bucket = index.get(areaId);
        if (!bucket) throw new Error(`${kind} "${item.id}" uses unknown focus area "${areaId}"`);
        bucket[kind].add(item.id);
      }
    }
  }
  return index;
}

/** Returns a predicate for one kind of item: O(1) per call. */
export function matcher(index, areaId, kind) {
  if (areaId === ALL) return () => true;
  const ids = index.get(areaId)?.[kind];
  return ids ? (id) => ids.has(id) : () => false;
}

export function countMatches(index, areaId) {
  if (areaId === ALL) return null;
  const bucket = index.get(areaId);
  return bucket ? { experience: bucket.experience.size, projects: bucket.projects.size } : null;
}
