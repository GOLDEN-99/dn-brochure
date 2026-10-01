import { TPromotionDetail, TProductRewardPool, TPromotionProductBase, TPromotionTier } from '../../types/crm-promotion.type';
import { CHEAPEST_ACTION, REGISTER_FEE_ACTION } from './promotion-actions';

// One promotion as one line of BU wording, for the list and detail pages.
//
// The grammar and every expected output live in the workspace doc CRM-PROMOTIONS.md §3b
// ("Golden cases"), not here. The till words the same promotions through DrugPOSApp's
// CrmPromotionDescriber, and the two only stay aligned because both test suites assert the
// same table -- change a row there first, then this and describe-promotion.spec.ts.
//
// The deal follows the legacy F11 goods row BU knows: "goods × N → result". Sections follow
// the legacy F11 tabs: goods / spend on a group / bill.

export type PromotionSection = 'GOODS' | 'SPEND' | 'BILL';

// Everything but the branch list, which the wording never reads -- so the list endpoint's
// branchCount shape (TPromotionListDetail) and a full detail both qualify.
export type DescribablePromotion = Omit<TPromotionDetail, 'branches'>;

export interface PromotionDescription {
  // null only for an unknown promotionType, which neither engine phase evaluates
  section: PromotionSection | null;
  // BU's name for the reward; null for an action the vocabulary does not know
  badge: string | null;
  // No legacy ancestor (GIFT, CHEAPEST, BILL money) -- shown to BU, never to cashiers
  isNewInCrm: boolean;
  // The deal line, or the warning text when isWarning
  deal: string;
  // The shape does nothing (or the wrong thing) at the till; render as a warning, not a deal
  isWarning: boolean;
  // Till-only guidance: what the cashier has to do, and who the promotion is for
  posHint: string | null;
}

// §3 "Legal combinations". Nothing in the stack enforces this matrix, so the describer
// is where an illegal shape becomes visible instead of silently pricing nothing.
const LEGAL_ACTIONS: Record<string, readonly string[]> = {
  'ITEM/ITEMEXIST': ['ITEMBATHDISC', 'ITEMPERCENTDISC', 'ITEMPRICE'],
  'BUNDLE/BUNDLECOUNT': ['BUNDLEPRICE', 'BUNDLEBATHDISC', 'BUNDLEPERCENTDISC', 'PWP', 'GIFT', CHEAPEST_ACTION],
  'BUNDLE/BUNDLESUBTOTAL': ['BUNDLEBATHDISC', 'BUNDLEPERCENTDISC', 'PWP', 'GIFT'],
  'BILL/BILLSUBTOTAL': ['BILLBATHDISC', 'BILLPERCENTDISC', 'PWP', 'GIFT', REGISTER_FEE_ACTION],
  // BILLCOUNT is offered by the form but is a deliberate no-op in the engine (§8 item 7)
  'BILL/BILLCOUNT': ['BILLBATHDISC', 'BILLPERCENTDISC', 'PWP', 'GIFT', REGISTER_FEE_ACTION],
};

const KNOWN_ACTIONS = new Set(Object.values(LEGAL_ACTIONS).flat());

const SECTIONS: Record<string, PromotionSection> = {
  ITEM: 'GOODS',
  BUNDLE: 'GOODS',
  BILL: 'BILL',
};

const GIFT_HINT = 'ยืนยันของแถมตอนคิดเงิน';
const PWP_HINT = 'ดูสิทธิ์ที่ F10 · ใช้ตอนคิดเงิน';

// #,##0.## -- en-US so the output does not depend on the browser locale
const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const fmt = (n: number): string => amount.format(n);

// Needs only header fields, so a list can place a row before its detail has loaded
export function promotionSection(promotionType: string, thresholdType: string): PromotionSection | null {
  if (promotionType === 'BUNDLE' && thresholdType === 'BUNDLESUBTOTAL') return 'SPEND';
  return SECTIONS[promotionType] ?? null;
}

export function describePromotion(d: DescribablePromotion): PromotionDescription {
  const section = promotionSection(d.promotionType, d.thresholdType);
  const groups = d.filterList ?? [];
  const tiers = [...(d.tiers ?? [])].sort((a, b) => a.thresholdValue - b.thresholdValue);

  const base = {
    section,
    badge: badgeFor(d.action, section, groups.length),
    isNewInCrm: isNewInCrm(d.action),
  };

  const warning = shapeWarning(d, section, tiers);
  if (warning) return { ...base, deal: warning, isWarning: true, posHint: null };

  return { ...base, deal: dealFor(d, section!, tiers), isWarning: false, posHint: posHintFor(d) };
}

function shapeWarning(d: DescribablePromotion, section: PromotionSection | null, tiers: TPromotionTier[]): string | null {
  if (section === null) return `ไม่รู้จักประเภท ${d.promotionType}`;
  if (!KNOWN_ACTIONS.has(d.action)) return `ไม่รู้จักสิทธิ์ ${d.action}`;
  if (d.thresholdType === 'BILLCOUNT') return 'ไม่มีผลที่เครื่องขาย (BILLCOUNT)';
  const legal = LEGAL_ACTIONS[`${d.promotionType}/${d.thresholdType}`];
  if (!legal) return `ไม่รู้จักเงื่อนไข ${d.thresholdType} สำหรับ ${d.promotionType}`;
  if (!legal.includes(d.action)) return `สิทธิ์ ${d.action} ใช้กับเงื่อนไข ${d.thresholdType} ไม่ได้`;
  if (tiers.length === 0) return 'ไม่มีขั้นสิทธิประโยชน์';
  return null;
}

function badgeFor(action: string, section: PromotionSection | null, groupCount: number): string | null {
  switch (action) {
    case 'ITEMPRICE':
    case 'ITEMBATHDISC':
    case 'ITEMPERCENTDISC':
      return 'โปรลดราคา';
    case 'BUNDLEPRICE':
      return groupCount >= 2 ? 'โปรแถม · จับคู่' : 'โปรแถม · ราคาชุด';
    case 'GIFT':
      return 'โปรแถม · ของแถม';
    case CHEAPEST_ACTION:
      return 'โปรแถม · ฟรีในชุด';
    case 'PWP':
      return 'แลกซื้อ';
    case 'BUNDLEBATHDISC':
    case 'BUNDLEPERCENTDISC':
      return section === 'SPEND' ? 'ซื้อครบยอด' : 'ลดราคาชุด';
    case 'BILLBATHDISC':
    case 'BILLPERCENTDISC':
      return 'ลดท้ายบิล';
    case REGISTER_FEE_ACTION:
      return 'ค่าสมาชิก';
    default:
      return null;
  }
}

function isNewInCrm(action: string): boolean {
  return action === 'GIFT' || action === CHEAPEST_ACTION || action === 'BILLBATHDISC' || action === 'BILLPERCENTDISC';
}

function posHintFor(d: DescribablePromotion): string | null {
  const hints: string[] = [];
  if (d.action === 'GIFT') hints.push(GIFT_HINT);
  if (d.action === 'PWP') hints.push(PWP_HINT);
  if (d.isMemberSpecific && d.members?.length) hints.push(`เฉพาะ ${d.members.map(m => m.memberName).join('/')}`);
  return hints.length ? hints.join(' · ') : null;
}

function dealFor(d: DescribablePromotion, section: PromotionSection, tiers: TPromotionTier[]): string {
  const groups = d.filterList ?? [];
  if (section === 'SPEND') return `${poolTerm(groups)} ${rungs(d, tiers, 'ครบ', 'ทุก')}`;
  if (section === 'BILL') {
    // A BILL pool scopes only the threshold; the reward is still a whole-bill lump (§5)
    if (groups.some(g => g.productList.length > 0)) return `${poolTerm(groups)} ${rungs(d, tiers, 'ครบ', 'ทุก')} (ท้ายบิล)`;
    return billRungs(d, tiers);
  }
  if (d.promotionType === 'ITEM') return `${itemTerm(groups)} → ${result(d, tiers[0].rewardValue)}`;
  return setDeal(d, tiers);
}

// ITEM is presence-only: one good reads "×1", a group reads as a count of goods
function itemTerm(groups: TPromotionDetail['filterList']): string {
  const goods = allGoods(groups);
  return goods.length === 1 ? `${goods[0].goodName} ×1` : `กลุ่มสินค้า ${goods.length} รายการ`;
}

// A spend or bill pool only names goods; it has no units
function poolTerm(groups: TPromotionDetail['filterList']): string {
  const goods = allGoods(groups);
  return goods.length === 1 ? goods[0].goodName : `กลุ่มสินค้า ${goods.length} รายการ`;
}

function setTerm(group: TPromotionDetail['filterList'][number], sets = 1): string {
  // The engine's own reading: a group with no filterValue needs 1 (CompleteBundles)
  const units = (group.filterValue > 0 ? group.filterValue : 1) * sets;
  return group.productList.length === 1
    ? `${group.productList[0].goodName} ×${units}`
    : `เลือก ${units} ชิ้นจากกลุ่มสินค้า ${group.productList.length} รายการ`;
}

function setDeal(d: DescribablePromotion, tiers: TPromotionTier[]): string {
  const groups = d.filterList ?? [];
  if (tiers.length === 1) {
    // A tier threshold counts SETS: "every 2 sets" of a 2-unit set is 4 units
    const sets = Math.max(1, tiers[0].thresholdValue);
    const subject = groups.length === 1
      ? setTerm(groups[0], sets)
      : withSets(groups.map(g => setTerm(g)).join(' + '), sets);
    return `${subject} → ${result(d, tiers[0].rewardValue)}`;
  }
  // A set ladder: the highest rung reached prices everything consumed (§3a "Ladders"), so
  // it is stated per rung rather than folded into the subject
  const subject = groups.map(g => setTerm(g)).join(' + ');
  return `${subject} ${tiers.map(t => `ครบ ${fmt(t.thresholdValue)} ชุด → ${result(d, t.rewardValue)}`).join(' · ')}`;
}

function withSets(subject: string, sets: number): string {
  return sets === 1 ? subject : `(${subject}) ×${sets}`;
}

function rungs(d: DescribablePromotion, tiers: TPromotionTier[], reach: string, every: string): string {
  if (d.isRepeat) return `${every} ${fmt(tiers[0].thresholdValue)} → ${result(d, tiers[0].rewardValue)}`;
  return tiers.map(t => `${reach} ${fmt(t.thresholdValue)} → ${result(d, t.rewardValue)}`).join(' · ');
}

function billRungs(d: DescribablePromotion, tiers: TPromotionTier[]): string {
  if (d.isRepeat) return `ทุก ${fmt(tiers[0].thresholdValue)} บาทในบิล → ${result(d, tiers[0].rewardValue)}`;
  return tiers
    .map(t => `${t.thresholdValue > 0 ? `ครบบิล ${fmt(t.thresholdValue)}` : 'ทุกบิล'} → ${result(d, t.rewardValue)}`)
    .join(' · ');
}

function result(d: DescribablePromotion, reward: number): string {
  switch (d.action) {
    case 'ITEMPRICE':
    case 'BUNDLEPRICE':
      return `${fmt(reward)}.-`;
    // An ITEM baht reward is a per-unit rate (CrmPromotionEngine.ApplyPhase1)
    case 'ITEMBATHDISC':
      return `ลด ${fmt(reward)}.-/ชิ้น`;
    case 'BUNDLEBATHDISC':
    case 'BILLBATHDISC':
      return `ลด ${fmt(reward)}.-`;
    case 'ITEMPERCENTDISC':
    case 'BUNDLEPERCENTDISC':
    case 'BILLPERCENTDISC':
      return `ลด ${fmt(reward)}%`;
    // The tier's rewardValue is the QUANTITY of free items (one choice from the pool)
    case 'GIFT':
      return d.rewardPool.length === 1
        ? `แถม ${d.rewardPool[0].goodName} ×${fmt(reward)}`
        : `แถม ${fmt(reward)} ชิ้น เลือกจาก ${d.rewardPool.length} รายการ`;
    // ...and for PWP the claim quota
    case 'PWP':
      return d.rewardPool.length === 1
        ? `แลกซื้อ ${d.rewardPool[0].goodName} ${poolBenefit(d.rewardPool[0])} (${fmt(reward)} สิทธิ์)`
        : `แลกซื้อได้ ${fmt(reward)} สิทธิ์ จาก ${d.rewardPool.length} รายการ`;
    case CHEAPEST_ACTION:
      return `ฟรีชิ้นถูกสุด ${fmt(reward)}`;
    // Boolean grant; the authored value is always 0, so it is never printed
    case REGISTER_FEE_ACTION:
      return 'ฟรีค่าสมัครสมาชิก';
    default:
      return d.action;
  }
}

// The pool's own benefit enum (PRICE | BATHDISC | PERCENTDISC), not the promotion action
function poolBenefit(item: TProductRewardPool): string {
  switch (item.itemBenefitType) {
    case 'BATHDISC': return `ลด ${fmt(item.itemBenefitValue)}.-`;
    case 'PERCENTDISC': return `ลด ${fmt(item.itemBenefitValue)}%`;
    default: return `${fmt(item.itemBenefitValue)}.-`;
  }
}

function allGoods(groups: TPromotionDetail['filterList']): TPromotionProductBase[] {
  return groups.flatMap(g => g.productList);
}
