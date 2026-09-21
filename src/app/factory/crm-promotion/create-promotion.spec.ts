import {
  provideCreatePromotionConfig,
  provideEditPromotionConfig,
} from './create-promotion';
import {
  CHEAPEST_ACTION,
  REGISTER_FEE_ACTION,
} from '../../lib/crm-promotion/promotion-actions';
import { TPromotionDetail } from '../../types/crm-promotion.type';

describe('provideCreatePromotionConfig', () => {
  describe('create-register-fee (ค่าสมาชิก)', () => {
    const config = provideCreatePromotionConfig('create-register-fee');

    it('is a BILL promotion pinned to the register-fee action', () => {
      expect(config.pageName).toBe('ค่าสมาชิก');
      expect(config.initialData.promotionMaster.promotionType).toBe('BILL');
      expect(config.initialData.promotionBenefit.action).toBe(REGISTER_FEE_ACTION);
      expect(config.initialData.promotionBenefit.thresholdType).toBe('BILLSUBTOTAL');
    });

    it('asks for the bill minimum and nothing else', () => {
      expect(config.rewardOption.fixedAction).toBeTrue();
      expect(config.rewardOption.showRewardInput).toBeFalse();
      // the threshold input is the bill minimum, so it stays visible
      expect(config.rewardOption.showThresholdInput).toBeUndefined();
      expect(config.initialData.promotionBenefit.tiers.length).toBe(1);
      expect(config.initialData.promotionBenefit.isRepeat).toBeFalse();
    });

    it('shows no product filter — it applies to the whole bill', () => {
      expect(config.filterOption.showFilter).toBeFalse();
    });
  });

  describe('create-cheapest (แถมในกลุ่ม)', () => {
    const config = provideCreatePromotionConfig('create-cheapest');

    it('is a BUNDLE promotion pinned to the cheapest action', () => {
      expect(config.pageName).toBe('แถมในกลุ่ม');
      expect(config.initialData.promotionMaster.promotionType).toBe('BUNDLE');
      expect(config.initialData.promotionBenefit.action).toBe(CHEAPEST_ACTION);
      expect(config.initialData.promotionBenefit.thresholdType).toBe('BUNDLECOUNT');
    });

    it('pins the threshold to one set and asks only for the free-unit count', () => {
      expect(config.rewardOption.fixedAction).toBeTrue();
      expect(config.rewardOption.showThresholdInput).toBeFalse();
      expect(config.initialData.promotionBenefit.tiers).toEqual([
        { thresholdValue: 1, rewardValue: 1 },
      ]);
      // repeating, so a basket of three sets earns the reward three times
      expect(config.initialData.promotionBenefit.isRepeat).toBeTrue();
    });

    it('needs a product filter — BUNDLE requires at least one group', () => {
      expect(config.filterOption.showFilter).toBeTrue();
      expect(config.filterOption.showBundle).toBeTrue();
    });
  });

  it('offers the new actions on the general pages of their promotion type', () => {
    const bill = provideCreatePromotionConfig('create-bill');
    const group = provideCreatePromotionConfig('create-group');
    const inline = provideCreatePromotionConfig('create-inline');

    const actions = (c: { rewardOption: { rewardList: { action: string }[] } }) =>
      c.rewardOption.rewardList.map((r) => r.action);

    expect(actions(bill)).toContain(REGISTER_FEE_ACTION);
    expect(actions(group)).toContain(CHEAPEST_ACTION);
    // and not on the type that cannot deliver them
    expect(actions(inline)).not.toContain(REGISTER_FEE_ACTION);
    expect(actions(inline)).not.toContain(CHEAPEST_ACTION);
  });

  describe('create-bill (ส่วนลดท้ายบิล)', () => {
    const config = provideCreatePromotionConfig('create-bill');

    it('offers a product pool so a bill threshold can be scoped to chosen goods', () => {
      // "Spend 500 baht on these items, get 50 off": CrmPromotionEngine.MeasureBill has always
      // measured only the named goods when a filter group is present, but no page could produce
      // a BILL promotion carrying one.
      expect(config.filterOption.showFilter).toBeTrue();
      expect(config.filterOption.showPool).toBeTrue();
    });

    it('is not a bundle page — no by-count group control', () => {
      expect(config.filterOption.showBundle).toBeFalse();
    });

    it('starts with no pool, so the threshold still measures the whole cart by default', () => {
      expect(config.initialData.promotionFilter).toEqual([]);
    });
  });

  describe('create-spend (ส่วนลดตามยอดซื้อกลุ่มสินค้า)', () => {
    const config = provideCreatePromotionConfig('create-spend');

    it('is a BUNDLE whose ladder is read in baht, not sets', () => {
      expect(config.initialData.promotionMaster.promotionType).toBe('BUNDLE');
      expect(config.initialData.promotionBenefit.thresholdType).toBe('BUNDLESUBTOTAL');
      // a ladder (500 -> 50, 700 -> 80) by default, not "every N"
      expect(config.initialData.promotionBenefit.isRepeat).toBeFalse();
      // pinned: BUNDLECOUNT here would turn the same ladder into "500 sets"
      expect(config.rewardOption.thresholdList.map((t) => t.threshold)).toEqual(['BUNDLESUBTOTAL']);
    });

    it('names its goods with a pool, never a by-count group', () => {
      expect(config.filterOption.showPool).toBeTrue();
      expect(config.filterOption.showBundle).toBeFalse();
    });

    it('does not offer the actions that need a set', () => {
      const actions = config.rewardOption.rewardList.map((r) => r.action);
      expect(actions).toEqual(['BUNDLEBATHDISC', 'BUNDLEPERCENTDISC', 'PWP', 'GIFT']);
    });
  });

  it('seeds an EXIST filter group at 1, the count the engine actually applies', () => {
    // The engine coerces 0 to 1 anyway; storing the 1 stops the row depending on that fallback.
    const inline = provideCreatePromotionConfig('create-inline');

    expect(inline.initialData.promotionFilter).toEqual([
      { filterType: 'EXIST', filterValue: 1, productList: [] },
    ]);
  });

  it('rejects an unknown path', () => {
    expect(() => provideCreatePromotionConfig('nope')).toThrow();
  });
});

describe('provideEditPromotionConfig', () => {
  const detail = (promotionType: string, action: string) =>
    ({
      id: 1,
      promotionName: 'x',
      promotionDesc: '',
      promotionType,
      source: 'HU',
      action,
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      isBranchSpecific: false,
      isMemberSpecific: false,
      startdate: '2026-01-01T00:00:00',
      enddate: '2026-12-31T00:00:00',
      limitTime: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      activeDays: '1111111',
      promotionStatus: 'ACTIVE',
      promotionPriority: 0,
      promotionOrder: 0,
      tiers: [{ thresholdValue: 1, rewardValue: 1 }],
      filterList: [],
      rewardPool: [],
      branches: [],
      members: [],
    }) as TPromotionDetail;

  // Without this the select on the edit page has no option matching the stored action,
  // and reopening the promotion would silently rewrite it to whatever renders first.
  it('keeps the new actions selectable when editing', () => {
    const bill = provideEditPromotionConfig(detail('BILL', REGISTER_FEE_ACTION));
    const bundle = provideEditPromotionConfig(detail('BUNDLE', CHEAPEST_ACTION));

    expect(bill.rewardOption.rewardList.map((r) => r.action)).toContain(REGISTER_FEE_ACTION);
    expect(bundle.rewardOption.rewardList.map((r) => r.action)).toContain(CHEAPEST_ACTION);
  });

  // The create and edit factories carry duplicate filter tables, so a pool enabled on one and
  // not the other would store fine and then vanish from the edit screen while still shipping in
  // the PUT body.
  // BUNDLE is two shapes under one promotionType. Opened with the set page's controls, a spend
  // promotion would offer BUNDLECOUNT only and be saved back as "500 sets".
  it('opens a spend promotion with the spend page controls, and a set bundle with its own', () => {
    const spend = provideEditPromotionConfig({
      ...detail('BUNDLE', 'BUNDLEBATHDISC'),
      thresholdType: 'BUNDLESUBTOTAL',
    });
    const set = provideEditPromotionConfig({
      ...detail('BUNDLE', 'BUNDLEBATHDISC'),
      thresholdType: 'BUNDLECOUNT',
    });

    expect(spend.filterOption.showPool).toBeTrue();
    expect(spend.rewardOption.thresholdList.map((t) => t.threshold)).toEqual(['BUNDLESUBTOTAL']);
    expect(set.filterOption.showBundle).toBeTrue();
    expect(set.rewardOption.thresholdList.map((t) => t.threshold)).toEqual(['BUNDLECOUNT']);
  });

  it('keeps a BILL promotion editable with its product pool visible', () => {
    const bill = provideEditPromotionConfig(detail('BILL', 'BILLBATHDISC'));

    expect(bill.filterOption.showFilter).toBeTrue();
    expect(bill.filterOption.showPool).toBeTrue();
  });
});
