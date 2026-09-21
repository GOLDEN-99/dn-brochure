// ⚠️ SUPERSEDED, kept for rows written before 2026-09-03.
//
// This module was written when `source` was effectively read-only on the API: create and
// update both dropped it, so every promotion stored after the column was added on
// 2026-05-13 came back null. That is no longer true -- the API now persists it on both
// endpoints and *requires* it (HU | SUPPLIER | BOTH), and the backfill in
// migration/2026-09-03-crm-promotion-source-backfill.sql repaired the rows written in
// between.
//
// So the inference below only fires on rows this heuristic cannot improve: the handful
// still carrying null (`Drug` had 2 of 21 at backfill time). New promotions never reach
// it. Delete the module once those rows are cleaned up.

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
