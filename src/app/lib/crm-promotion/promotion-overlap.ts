import {
  TBranch,
  TCreatePromotionRequest,
  TPromotionDetail,
  TPromotionListItem,
  TPromotionProductBase,
} from '../../types/crm-promotion.type';
import { productKey, TProductRef } from './product-key';
import { isPoolOnlyAction, REGISTER_FEE_ACTION, SPEND_THRESHOLD } from './promotion-actions';

// What happens at the till when a promotion being saved names a good that a live promotion of
// the same kind already names. The rules are the engine's (DrugPOSApp sale RULES §1.22, §1.23;
// CrmPromotionEngine.RunGroup / Fold.Claimed), restated here so the author sees the outcome
// BEFORE saving rather than the cashier seeing nothing. Pure: the service fetches, this decides.
//
// §1.22 in one breath: priority is exclusive inside a group (ITEM, set BUNDLE, BUNDLESUBTOTAL,
// BILL) and never reaches across. Levels run highest first; on a level above 0 exactly one
// promotion may produce money — two that both do yield NOTHING, silently — and the one that does
// skips the rest of the group, priority 0 included. Priority 0 is the open tier: everything
// stacks, in PromotionOrder descending then id. §1.23: two set bundles at 0 take turns on the
// shared units, the earlier takes its sets, the later sees only what is left. GIFT, PWP and
// REGISTERFEE never count as an activation and never collide.

export type PromotionGroup = 'ITEM' | 'SET' | 'SPEND' | 'BILL';

export type OverlapOutcome =
  // same non-zero priority: when both fire the level yields nothing at all
  | 'COLLISION'
  // different priorities, at least one above 0: the higher one settles the group and skips the other
  | 'EXCLUSIVE'
  // both at 0, set bundles: units go to one set each, first in run order takes first
  | 'SHARES_UNITS'
  // both at 0, spend bundles: nothing is consumed, both discounts land on the same goods
  | 'STACKS';

// What the resolver reads of a live promotion. The header and the products, members and days
// come from GET /crm/promotions?include=details; the list reduces branches to a count, so they
// are optional and the service fetches GET /:id only when both sides are branch-specific.
export type ExistingPromotion = Omit<TPromotionDetail, 'branches'> & { branches?: TBranch[] };

export type PromotionOverlap = {
  existing: ExistingPromotion;
  outcome: OverlapOutcome;
  // EXCLUSIVE: the existing one has the higher priority. SHARES_UNITS: the existing one runs
  // first in the open tier. Meaningless for COLLISION and STACKS.
  existingFirst: boolean;
  // The existing promotion's rows for the goods both name (they carry the names to show)
  sharedProducts: TPromotionProductBase[];
};

export type OverlapReport = {
  overlaps: PromotionOverlap[];
  // At least one COLLISION: the save is refused, not confirmed
  blocking: boolean;
};

export const EMPTY_OVERLAP_REPORT: OverlapReport = { overlaps: [], blocking: false };

export function promotionGroup(promotionType: string, thresholdType: string): PromotionGroup | null {
  if (promotionType === 'BUNDLE') return thresholdType === SPEND_THRESHOLD ? 'SPEND' : 'SET';
  if (promotionType === 'ITEM') return 'ITEM';
  if (promotionType === 'BILL') return 'BILL';
  return null;
}

/** Counts as an activation under §1.22. GIFT, PWP and REGISTERFEE are collected outside the rule. */
export const isActivatingAction = (action: string): boolean =>
  !isPoolOnlyAction(action) && action !== REGISTER_FEE_ACTION;

// Only BUNDLE promotions are checked today. Their activation is a set of goods the cart has
// to contain, and the same good sits in many sets, so they are the ones that collide. ITEM
// overlaps already have their own view in the item-price import; a BILL names no goods.
export function needsOverlapCheck(req: Pick<TCreatePromotionRequest, 'promotionType' | 'action'>): boolean {
  return req.promotionType === 'BUNDLE' && isActivatingAction(req.action);
}

// ── Candidate screen on header fields alone ──────────────────────────────────

type Header = Pick<TPromotionListItem,
  'id' | 'promotionType' | 'thresholdType' | 'action' | 'promotionStatus' | 'startdate' | 'enddate'>;

/**
 * Whether a list row could overlap at all, from what every list shape carries: same §1.22 group,
 * both activating, live, and the date ranges touch. Products and scope need the details.
 */
export function isHeaderCandidate(req: TCreatePromotionRequest, item: Header, editingId?: number): boolean {
  if (editingId !== undefined && item.id === editingId) return false;
  if (item.promotionStatus !== 'ACTIVE') return false;
  const group = promotionGroup(req.promotionType, req.thresholdType);
  if (group === null || group !== promotionGroup(item.promotionType, item.thresholdType)) return false;
  if (!isActivatingAction(req.action) || !isActivatingAction(item.action)) return false;
  return datesIntersect(req.startDate, req.endDate, item.startdate, item.enddate);
}

// ── Scope ────────────────────────────────────────────────────────────────────

// Compared by calendar day, both ends inclusive: the till tests now.Date against
// StartDate.Date / EndDate.Date, so a promotion is live all of its last day.
const isoDay = (s: string): string => (s ?? '').slice(0, 10);

export function datesIntersect(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return isoDay(aStart) <= isoDay(bEnd) && isoDay(bStart) <= isoDay(aEnd);
}

// "1111111" per side; a missing or short value is read as every day (the engine's default).
export function daysIntersect(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || a.length < 7 || !b || b.length < 7) return true;
  for (let i = 0; i < 7; i++) if (a[i] === '1' && b[i] === '1') return true;
  return false;
}

const hhmm = (t: string): string => (t ?? '').slice(0, 5);

// A window only narrows a promotion that limits time; two that both do are disjoint only when one
// ends before the other starts. A window whose end is not after its start is not understood
// (endTime 00:00 is an open question, ClickUp 86eynabyf) and is read as the whole day.
export function timesIntersect(
  a: { limitTime: boolean; startTime: string; endTime: string },
  b: { limitTime: boolean; startTime: string; endTime: string },
): boolean {
  if (!a.limitTime || !b.limitTime) return true;
  const [as, ae, bs, be] = [hhmm(a.startTime), hhmm(a.endTime), hhmm(b.startTime), hhmm(b.endTime)];
  if (ae <= as || be <= bs) return true;
  return as < be && bs < ae;
}

export function membersIntersect(req: TCreatePromotionRequest, existing: ExistingPromotion): boolean {
  if (!req.isMemberSpecific || !existing.isMemberSpecific) return true;
  const ids = new Set(req.members);
  return (existing.members ?? []).some((m) => ids.has(m.id));
}

/** `null` when both sides are branch-specific but the existing branch list has not been loaded. */
export function branchesIntersect(req: TCreatePromotionRequest, existing: ExistingPromotion): boolean | null {
  if (!req.isBranchSpecific || !existing.isBranchSpecific) return true;
  if (!existing.branches) return null;
  const codes = new Set(req.branches);
  return existing.branches.some((b) => codes.has(b.branchCode));
}

export const needsBranchList = (req: TCreatePromotionRequest, existing: ExistingPromotion): boolean =>
  branchesIntersect(req, existing) === null;

// ── Products ─────────────────────────────────────────────────────────────────

// A product is the pair (goodCode, unitCode). A stored row whose unit is still null (not yet
// backfilled) overlaps every unit of that good, as the item-price import reads it.
const productsMatch = (a: TProductRef, b: TProductRef): boolean =>
  a.goodCode === b.goodCode && (a.unitCode == null || b.unitCode == null || a.unitCode === b.unitCode);

/** The existing promotion's product rows that the request also names, in any of its groups. */
export function sharedProducts(req: TCreatePromotionRequest, existing: ExistingPromotion): TPromotionProductBase[] {
  const mine = req.filterList.flatMap((f) => f.products ?? []);
  if (mine.length === 0) return [];
  const seen = new Set<string>();
  const out: TPromotionProductBase[] = [];
  for (const group of existing.filterList ?? []) {
    for (const p of group.productList ?? []) {
      const key = productKey(p);
      if (seen.has(key)) continue;
      if (mine.some((m) => productsMatch(m, p))) {
        seen.add(key);
        out.push(p);
      }
    }
  }
  return out;
}

// ── Outcome ──────────────────────────────────────────────────────────────────

/**
 * One live promotion against the request, or null when they cannot both be active on one bill.
 * An unloaded branch list is read as intersecting: the service is expected to have fetched it,
 * and guessing "no overlap" is the one wrong answer this check exists to prevent.
 */
export function resolveOverlap(
  req: TCreatePromotionRequest,
  existing: ExistingPromotion,
  editingId?: number,
): PromotionOverlap | null {
  if (!isHeaderCandidate(req, existing, editingId)) return null;
  if (!daysIntersect(req.activeDay, existing.activeDays)) return null;
  if (!timesIntersect(req, existing)) return null;
  if (!membersIntersect(req, existing)) return null;
  if (branchesIntersect(req, existing) === false) return null;
  const shared = sharedProducts(req, existing);
  if (shared.length === 0) return null;

  const group = promotionGroup(req.promotionType, req.thresholdType);
  const mine = req.promotionPriority;
  const theirs = existing.promotionPriority;

  if (mine > 0 && theirs > 0 && mine === theirs)
    return { existing, outcome: 'COLLISION', existingFirst: false, sharedProducts: shared };
  if (mine > 0 || theirs > 0)
    return { existing, outcome: 'EXCLUSIVE', existingFirst: theirs > mine, sharedProducts: shared };

  // Open tier. Run order: PromotionOrder descending, then id ascending; a promotion being
  // created has no id yet and would be the newest, so the existing one goes first on a tie.
  const existingFirst =
    existing.promotionOrder !== req.promotionOrder
      ? existing.promotionOrder > req.promotionOrder
      : editingId === undefined || existing.id < editingId;
  return {
    existing,
    outcome: group === 'SET' ? 'SHARES_UNITS' : 'STACKS',
    existingFirst,
    sharedProducts: shared,
  };
}

export function resolveOverlaps(
  req: TCreatePromotionRequest,
  existing: readonly ExistingPromotion[],
  editingId?: number,
): OverlapReport {
  const overlaps = existing
    .map((e) => resolveOverlap(req, e, editingId))
    .filter((o): o is PromotionOverlap => o !== null)
    .sort((a, b) => RANK[a.outcome] - RANK[b.outcome] || a.existing.id - b.existing.id);
  return { overlaps, blocking: overlaps.some((o) => o.outcome === 'COLLISION') };
}

const RANK: Record<OverlapOutcome, number> = { COLLISION: 0, EXCLUSIVE: 1, SHARES_UNITS: 2, STACKS: 3 };
