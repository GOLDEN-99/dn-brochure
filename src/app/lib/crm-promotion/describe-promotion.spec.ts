import { TPromotionDetail, TPromotionProductBase, TProductRewardPool } from '../../types/crm-promotion.type';
import { describePromotion, PromotionDescription } from './describe-promotion';

// The golden cases G01-G21 are CRM-PROMOTIONS.md §3b, row for row. DrugPOSApp's
// CrmPromotionDescriber asserts the same table; if a row changes, change the doc first.

const good = (name: string): TPromotionProductBase => ({ goodCode: name, goodName: name, sku: name });
const goods = (n: number): TPromotionProductBase[] => Array.from({ length: n }, (_, i) => good(`G${i + 1}`));
const group = (products: TPromotionProductBase[], filterValue = 1) => ({ filterType: 'COUNT', filterValue, productList: products });
const pool = (name: string, itemBenefitType = 'PRICE', itemBenefitValue = 0): TProductRewardPool =>
  ({ ...good(name), itemBenefitType, itemBenefitValue });

function promo(over: Partial<TPromotionDetail>): TPromotionDetail {
  return {
    id: 1, promotionName: 'test', promotionDesc: '', promotionType: 'ITEM', source: 'HU',
    action: 'ITEMPRICE', thresholdType: 'ITEMEXIST', isRepeat: true,
    isBranchSpecific: false, isMemberSpecific: false,
    startdate: '2026-10-01', enddate: '2026-10-31', limitTime: false, startTime: '', endTime: '',
    activeDays: '1111111', promotionStatus: 'ACTIVE', promotionPriority: 0, promotionOrder: 0,
    tiers: [], filterList: [], rewardPool: [], branches: [], members: [],
    ...over,
  };
}

const item = (action: string, products: TPromotionProductBase[], reward: number) =>
  promo({ promotionType: 'ITEM', thresholdType: 'ITEMEXIST', action, isRepeat: true,
    filterList: [group(products)], tiers: [{ thresholdValue: 0, rewardValue: reward }] });

const set = (action: string, groups: ReturnType<typeof group>[], reward: number, rewardPool: TProductRewardPool[] = []) =>
  promo({ promotionType: 'BUNDLE', thresholdType: 'BUNDLECOUNT', action, isRepeat: true,
    filterList: groups, tiers: [{ thresholdValue: 1, rewardValue: reward }], rewardPool });

const spend = (action: string, tiers: [number, number][], isRepeat = false) =>
  promo({ promotionType: 'BUNDLE', thresholdType: 'BUNDLESUBTOTAL', action, isRepeat,
    filterList: [{ filterType: 'EXIST', filterValue: 1, productList: goods(5) }],
    tiers: tiers.map(([thresholdValue, rewardValue]) => ({ thresholdValue, rewardValue })) });

const bill = (action: string, threshold: number, reward: number, rewardPool: TProductRewardPool[] = [], thresholdType = 'BILLSUBTOTAL') =>
  promo({ promotionType: 'BILL', thresholdType, action, isRepeat: false,
    tiers: [{ thresholdValue: threshold, rewardValue: reward }], rewardPool });

const vida = good("Vida C 30's");

type Golden = [id: string, input: TPromotionDetail, expected: Omit<PromotionDescription, 'isWarning'> & { isWarning?: boolean }];

const GOLDEN: Golden[] = [
  ['G01', item('ITEMPRICE', [vida], 89),
    { section: 'GOODS', badge: 'โปรลดราคา', isNewInCrm: false, deal: "Vida C 30's ×1 → 89.-", posHint: null }],
  ['G02', item('ITEMBATHDISC', [vida], 10),
    { section: 'GOODS', badge: 'โปรลดราคา', isNewInCrm: false, deal: "Vida C 30's ×1 → ลด 10.-/ชิ้น", posHint: null }],
  ['G03', item('ITEMPERCENTDISC', goods(5), 20),
    { section: 'GOODS', badge: 'โปรลดราคา', isNewInCrm: false, deal: 'กลุ่มสินค้า 5 รายการ → ลด 20%', posHint: null }],
  ['G04', { ...item('ITEMPRICE', [vida], 89), isMemberSpecific: true, members: [{ id: 1, memberName: 'VIP', custType: '3' }] },
    { section: 'GOODS', badge: 'โปรลดราคา', isNewInCrm: false, deal: "Vida C 30's ×1 → 89.-", posHint: 'เฉพาะ VIP' }],
  ['G05', set('BUNDLEPRICE', [group([good('Eucerin Hyaluron')], 2)], 1290),
    { section: 'GOODS', badge: 'โปรแถม · ราคาชุด', isNewInCrm: false, deal: 'Eucerin Hyaluron ×2 → 1,290.-', posHint: null }],
  ['G06', set('BUNDLEPRICE', [group([good('Natura A')]), group([good('Natura B')])], 450),
    { section: 'GOODS', badge: 'โปรแถม · จับคู่', isNewInCrm: false, deal: 'Natura A ×1 + Natura B ×1 → 450.-', posHint: null }],
  ['G07', set('BUNDLEBATHDISC', [group([vida], 3)], 50),
    { section: 'GOODS', badge: 'ลดราคาชุด', isNewInCrm: false, deal: "Vida C 30's ×3 → ลด 50.-", posHint: null }],
  ['G08', set('GIFT', [group([good('Cetaphil 250ml')])], 1, [pool('Cetaphil mini')]),
    { section: 'GOODS', badge: 'โปรแถม · ของแถม', isNewInCrm: true, deal: 'Cetaphil 250ml ×1 → แถม Cetaphil mini ×1', posHint: 'ยืนยันของแถมตอนคิดเงิน' }],
  ['G09', set('GIFT', [group([good('Cetaphil 250ml')])], 1, [pool('Cetaphil mini'), pool('Cetaphil travel')]),
    { section: 'GOODS', badge: 'โปรแถม · ของแถม', isNewInCrm: true, deal: 'Cetaphil 250ml ×1 → แถม 1 ชิ้น เลือกจาก 2 รายการ', posHint: 'ยืนยันของแถมตอนคิดเงิน' }],
  ['G10', set('GIFT', [group([good('Natura A')])], 1, [pool('Natura A')]),
    { section: 'GOODS', badge: 'โปรแถม · ของแถม', isNewInCrm: true, deal: 'Natura A ×1 → แถม Natura A ×1', posHint: 'ยืนยันของแถมตอนคิดเงิน' }],
  ['G11', set('CHEAPEST', [group(goods(8), 3)], 1),
    { section: 'GOODS', badge: 'โปรแถม · ฟรีในชุด', isNewInCrm: true, deal: 'เลือก 3 ชิ้นจากกลุ่มสินค้า 8 รายการ → ฟรีชิ้นถูกสุด 1', posHint: null }],
  ['G12', set('PWP', [group([good('Blackmores')], 2)], 1, [pool('ผ้าเช็ดหน้า')]),
    { section: 'GOODS', badge: 'แลกซื้อ', isNewInCrm: false, deal: 'Blackmores ×2 → แลกซื้อ ผ้าเช็ดหน้า 0.- (1 สิทธิ์)', posHint: 'ดูสิทธิ์ที่ F10 · ใช้ตอนคิดเงิน' }],
  ['G13', spend('BUNDLEBATHDISC', [[500, 50], [700, 80]]),
    { section: 'SPEND', badge: 'ซื้อครบยอด', isNewInCrm: false, deal: 'กลุ่มสินค้า 5 รายการ ครบ 500 → ลด 50.- · ครบ 700 → ลด 80.-', posHint: null }],
  ['G14', spend('BUNDLEBATHDISC', [[500, 50]], true),
    { section: 'SPEND', badge: 'ซื้อครบยอด', isNewInCrm: false, deal: 'กลุ่มสินค้า 5 รายการ ทุก 500 → ลด 50.-', posHint: null }],
  ['G15', spend('BUNDLEPERCENTDISC', [[1000, 10]]),
    { section: 'SPEND', badge: 'ซื้อครบยอด', isNewInCrm: false, deal: 'กลุ่มสินค้า 5 รายการ ครบ 1,000 → ลด 10%', posHint: null }],
  ['G16', bill('BILLBATHDISC', 1000, 100),
    { section: 'BILL', badge: 'ลดท้ายบิล', isNewInCrm: true, deal: 'ครบบิล 1,000 → ลด 100.-', posHint: null }],
  ['G17', bill('GIFT', 1000, 1, [pool('ร่มพับ')]),
    { section: 'BILL', badge: 'โปรแถม · ของแถม', isNewInCrm: true, deal: 'ครบบิล 1,000 → แถม ร่มพับ ×1', posHint: 'ยืนยันของแถมตอนคิดเงิน' }],
  ['G18', bill('REGISTERFEE', 300, 0),
    { section: 'BILL', badge: 'ค่าสมาชิก', isNewInCrm: false, deal: 'ครบบิล 300 → ฟรีค่าสมัครสมาชิก', posHint: null }],
  ['G19', bill('REGISTERFEE', 0, 0),
    { section: 'BILL', badge: 'ค่าสมาชิก', isNewInCrm: false, deal: 'ทุกบิล → ฟรีค่าสมัครสมาชิก', posHint: null }],
  ['G20', bill('BILLBATHDISC', 3, 20, [], 'BILLCOUNT'),
    { section: 'BILL', badge: 'ลดท้ายบิล', isNewInCrm: true, deal: 'ไม่มีผลที่เครื่องขาย (BILLCOUNT)', isWarning: true, posHint: null }],
  ['G21', item('ITEMFOO', [vida], 10),
    { section: 'GOODS', badge: null, isNewInCrm: false, deal: 'ไม่รู้จักสิทธิ์ ITEMFOO', isWarning: true, posHint: null }],
];

describe('describePromotion — golden cases (CRM-PROMOTIONS.md §3b)', () => {
  for (const [id, input, expected] of GOLDEN) {
    it(`${id}: ${expected.deal}`, () => {
      expect(describePromotion(input)).toEqual({ isWarning: false, ...expected });
    });
  }
});

describe('describePromotion — shapes outside the golden table', () => {
  it('warns on a set-only action under a spend threshold, which the engine ignores', () => {
    const d = describePromotion(spend('BUNDLEPRICE', [[500, 399]]));
    expect(d.isWarning).toBeTrue();
    expect(d.deal).toBe('สิทธิ์ BUNDLEPRICE ใช้กับเงื่อนไข BUNDLESUBTOTAL ไม่ได้');
  });

  it('warns on an unknown threshold type, which the engine reads as "always true"', () => {
    const d = describePromotion({ ...item('ITEMPRICE', [vida], 89), thresholdType: 'ITEMCOUNT' });
    expect(d.isWarning).toBeTrue();
    expect(d.deal).toBe('ไม่รู้จักเงื่อนไข ITEMCOUNT สำหรับ ITEM');
  });

  it('has no section for an unknown promotion type', () => {
    const d = describePromotion({ ...item('ITEMPRICE', [vida], 89), promotionType: 'COMBO' });
    expect(d.section).toBeNull();
    expect(d.deal).toBe('ไม่รู้จักประเภท COMBO');
  });

  it('warns on a promotion with no tiers rather than inventing a reward', () => {
    const d = describePromotion({ ...item('ITEMPRICE', [vida], 89), tiers: [] });
    expect(d.isWarning).toBeTrue();
  });

  it('reads a multi-set threshold as units: every 2 sets of a 2-unit set is 4 units', () => {
    const d = describePromotion({ ...set('BUNDLEPRICE', [group([good('Eucerin Hyaluron')], 2)], 2400), tiers: [{ thresholdValue: 2, rewardValue: 2400 }] });
    expect(d.deal).toBe('Eucerin Hyaluron ×4 → 2,400.-');
  });

  it('states a set ladder rung by rung, sorted by threshold', () => {
    const d = describePromotion({
      ...set('BUNDLEBATHDISC', [group([vida])], 0),
      isRepeat: false,
      tiers: [{ thresholdValue: 3, rewardValue: 50 }, { thresholdValue: 2, rewardValue: 20 }],
    });
    expect(d.deal).toBe("Vida C 30's ×1 ครบ 2 ชุด → ลด 20.- · ครบ 3 ชุด → ลด 50.-");
  });

  it('marks a pool-scoped BILL promotion as a whole-bill reward', () => {
    const d = describePromotion({ ...bill('BILLBATHDISC', 500, 50), filterList: [{ filterType: 'EXIST', filterValue: 1, productList: goods(3) }] });
    expect(d.deal).toBe('กลุ่มสินค้า 3 รายการ ครบ 500 → ลด 50.- (ท้ายบิล)');
  });

  it('words a discounted PWP pool item by its own benefit type', () => {
    const d = describePromotion(set('PWP', [group([good('Blackmores')], 2)], 2, [pool('ผ้าเช็ดหน้า', 'PERCENTDISC', 50)]));
    expect(d.deal).toBe('Blackmores ×2 → แลกซื้อ ผ้าเช็ดหน้า ลด 50% (2 สิทธิ์)');
  });

  it('joins the GIFT and member hints', () => {
    const d = describePromotion({ ...set('GIFT', [group([good('Cetaphil 250ml')])], 1, [pool('Cetaphil mini')]),
      isMemberSpecific: true, members: [{ id: 1, memberName: 'VIP', custType: '3' }, { id: 2, memberName: 'HUG Club', custType: '6' }] });
    expect(d.posHint).toBe('ยืนยันของแถมตอนคิดเงิน · เฉพาะ VIP/HUG Club');
  });
});
