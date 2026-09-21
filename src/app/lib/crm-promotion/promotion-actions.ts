// Reward-action identifiers that code branches on, kept in a module of their own: the
// page config, the form schema and the request builder all need them, and the config
// already imports the schema's form type, so declaring them beside the config would
// close an import cycle.
//
// ⚠️ Naming rule for anything added here. DrugPos routes actions by SUFFIX --
// CrmPromotionEngine tests EndsWith on GIFT, PWP, PERCENTDISC, BATHDISC and PRICE --
// so a name ending in one of those is silently handled as that other action, with no
// error anywhere. The API adds a second rule: it caps every tier's rewardValue at 100
// for any action *containing* PERCENT. Check a new name against both.

// Puts the register-fee SKU on the bill at 0 baht. The vendor service reads that line
// to promote a customer from custType 17 (LineCRM) to 6 (HUG Club).
export const REGISTER_FEE_ACTION = 'REGISTERFEE';

// The N cheapest units of the bundle become free, N authored per tier.
export const CHEAPEST_ACTION = 'CHEAPEST';

// ค่าสมัครสมาชิก HUG Club. The only SKU a REGISTERFEE promotion ever carries, which is
// why its reward pool is derived at submit rather than authored.
//
// This is the single hardcode of the SKU, deliberately on this side: every REGISTERFEE
// promotion ships it to the branches as rewardPool[0].goodCode, so DrugPos should read
// it from the synced promotion rather than keep its own copy. Two copies would drift
// the day the code changes, and the till's copy is the one nobody here can grep for.
export const REGISTER_FEE_GOOD_CODE = '11755';

// ── Threshold semantics ────────────────────────────────────────────────────
// What a tier's thresholdValue counts, per thresholdType. The floor is NOT
// uniformly 0: a BILLSUBTOTAL of 0 is the legitimate "any bill, no minimum",
// but a COUNT of 0 is satisfied by an empty basket -- and on a repeating tier
// that is satisfied an unbounded number of times, so it reaches the till as an
// infinite discount. This is the rule the old blanket `min(thresholdValue, 0)`
// could not express, because the floor depends on a sibling field.
export const THRESHOLD_RULES: Record<
  string,
  { min: number; integer: boolean; unit: string }
> = {
  // baht -- 0 means "no minimum", a real authoring choice
  BILLSUBTOTAL: { min: 0, integer: false, unit: 'บาท' },
  // pieces in the bill
  BILLCOUNT: { min: 1, integer: true, unit: 'ชิ้น' },
  // complete sets of the filter group
  BUNDLECOUNT: { min: 1, integer: true, unit: 'ชุด' },
  // baht spent on the filter group's goods. Unlike BILLSUBTOTAL there is no
  // "no minimum" reading -- a spend promotion with nothing to reach is an ITEM
  // discount, and belongs on that page.
  BUNDLESUBTOTAL: { min: 1, integer: false, unit: 'บาท' },
  // presence-only: the threshold is not authored and stays 0
  ITEMEXIST: { min: 0, integer: true, unit: '' },
};

// "Spend N baht on these goods": a BUNDLE whose tiers are read against the pool's
// baht rather than a set count (DrugPOSApp sale RULES §1.20). The filter group is a
// plain EXIST pool that only NAMES the goods -- the baht lives on the tiers, never in
// filterValue, which the engine always reads as a unit count.
export const SPEND_THRESHOLD = 'BUNDLESUBTOTAL';

// The actions a spend threshold can carry. BUNDLEPRICE and CHEAPEST are statements
// about a SET ("the set costs X", "the cheapest unit of the set is free"); a spend
// threshold has no set, and the engine deliberately does nothing with them.
export const SPEND_ACTIONS = ['BUNDLEBATHDISC', 'BUNDLEPERCENTDISC', 'PWP', 'GIFT'] as const;

export const isSpendAction = (action: string): boolean =>
  (SPEND_ACTIONS as readonly string[]).includes(action);

// Actions whose whole benefit lives in rewardPool, so the tier's rewardValue
// carries no meaning -- it must not be required of the author, and must not be
// read as an amount by anything downstream.
export const POOL_ONLY_ACTIONS = ['PWP', 'GIFT'] as const;

// Actions that set an absolute price rather than deduct an amount. 0 is valid
// (the item becomes free); every other action needs a reward > 0 or the
// promotion does nothing at the till.
export const PRICE_ACTIONS = ['BUNDLEPRICE', 'ITEMPRICE'] as const;

export const isPoolOnlyAction = (action: string): boolean =>
  (POOL_ONLY_ACTIONS as readonly string[]).includes(action);

export const isPriceAction = (action: string): boolean =>
  (PRICE_ACTIONS as readonly string[]).includes(action);

// The reward pool's per-item benefit type is its own small enum, distinct from
// the promotion-level action: PERCENTDISC here, not PERCENT. A percent cap that
// tests for 'PERCENT' never fires -- that was the bug in the unwired
// promotionRewardPercentSchema.
export const POOL_PERCENT_TYPE = 'PERCENTDISC';
