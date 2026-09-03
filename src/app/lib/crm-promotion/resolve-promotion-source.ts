// `source` is effectively read-only on the API: the create and update endpoints both
// drop it (their CreatePromotionRequest has no such member and neither SQL statement
// touches the column), so every promotion stored since the column was added on
// 2026-05-13 comes back null. The form still sends it, so this stops being needed the
// day the API persists it.

// True when the API gave us nothing to show — the value below is then a guess, and
// callers that put it in front of a user should say so rather than pass it off as
// stored data.
export function isPromotionSourceInferred(
  source: string | null | undefined,
): boolean {
  return !source;
}

// Derive the value that keeps the stored promotionOrder legal: an HU promotion is
// forced to order 0, so a non-zero order can only belong to a supplier promotion.
// Keep this the single heuristic in the module — the edit form and the detail page
// disagreeing about a promotion's owner is worse than either answer.
export function resolvePromotionSource(
  source: string | null | undefined,
  promotionOrder: number,
): string {
  if (!isPromotionSourceInferred(source)) return source as string;
  return promotionOrder === 0 ? 'HU' : 'SUPPLIER';
}
