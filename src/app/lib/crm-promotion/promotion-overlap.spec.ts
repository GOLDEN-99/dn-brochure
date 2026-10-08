import { TCreatePromotionRequest, TPromotionProductBase } from '../../types/crm-promotion.type';
import {
  branchesIntersect,
  daysIntersect,
  ExistingPromotion,
  isHeaderCandidate,
  needsBranchList,
  needsOverlapCheck,
  resolveOverlap,
  resolveOverlaps,
  sharedProducts,
  timesIntersect,
} from './promotion-overlap';

// The outcomes are DrugPOSApp sale RULES §1.22 / §1.23 as the author should read them before
// saving. The engine is the authority; a row here that disagrees with CrmPromotionEngine is
// wrong here.

const good = (goodCode: string, unitCode: string | null = 'U1'): TPromotionProductBase =>
  ({ goodCode, goodName: `name ${goodCode}`, sku: goodCode, unitCode });

const ref = (goodCode: string, unitCode: string | null = 'U1') => ({ goodCode, unitCode });

function request(over: Partial<TCreatePromotionRequest> = {}): TCreatePromotionRequest {
  return {
    promotionName: 'new', promotionDesc: '', promotionType: 'BUNDLE', source: 'SUPPLIER',
    promotionOrder: 0, promotionPriority: 0,
    startDate: '2026-10-01', endDate: '2026-10-31',
    isBranchSpecific: false, branches: [], isMemberSpecific: false, members: [],
    limitTime: false, startTime: '00:00:00', endTime: '00:00:00', activeDay: '1111111',
    filterList: [{ filterType: 'COUNT', filterValue: 2, productList: ['A'], products: [ref('A')] }],
    action: 'BUNDLEPRICE', thresholdType: 'BUNDLECOUNT', isRepeat: true,
    tiers: [{ thresholdValue: 1, rewardValue: 150 }], rewardPool: [],
    ...over,
  };
}

function existing(over: Partial<ExistingPromotion> = {}): ExistingPromotion {
  return {
    id: 10, promotionName: 'live', promotionDesc: '', promotionType: 'BUNDLE', source: 'SUPPLIER',
    action: 'BUNDLEBATHDISC', thresholdType: 'BUNDLECOUNT', isRepeat: true,
    isBranchSpecific: false, isMemberSpecific: false,
    startdate: '2026-10-15T00:00:00', enddate: '2026-11-15T00:00:00',
    limitTime: false, startTime: '', endTime: '', activeDays: '1111111',
    promotionStatus: 'ACTIVE', promotionPriority: 0, promotionOrder: 0,
    tiers: [{ thresholdValue: 1, rewardValue: 50 }],
    filterList: [{ filterType: 'COUNT', filterValue: 3, productList: [good('A')] }],
    rewardPool: [], members: [],
    ...over,
  };
}

describe('promotion-overlap: which saves are checked', () => {
  it('checks a set bundle with a discount action', () => {
    expect(needsOverlapCheck({ promotionType: 'BUNDLE', action: 'BUNDLEPRICE' })).toBeTrue();
    expect(needsOverlapCheck({ promotionType: 'BUNDLE', action: 'CHEAPEST' })).toBeTrue();
  });

  it('checks a spend bundle with a discount action', () => {
    expect(needsOverlapCheck({ promotionType: 'BUNDLE', action: 'BUNDLEPERCENTDISC' })).toBeTrue();
  });

  // GIFT and PWP are collected at every level and never count as an activation (§1.22)
  it('skips GIFT and PWP bundles', () => {
    expect(needsOverlapCheck({ promotionType: 'BUNDLE', action: 'GIFT' })).toBeFalse();
    expect(needsOverlapCheck({ promotionType: 'BUNDLE', action: 'PWP' })).toBeFalse();
  });

  it('skips ITEM and BILL promotions', () => {
    expect(needsOverlapCheck({ promotionType: 'ITEM', action: 'ITEMPRICE' })).toBeFalse();
    expect(needsOverlapCheck({ promotionType: 'BILL', action: 'BILLBATHDISC' })).toBeFalse();
  });
});

describe('promotion-overlap: header screen', () => {
  const req = request();

  it('keeps a live set bundle whose dates touch', () => {
    expect(isHeaderCandidate(req, existing())).toBeTrue();
  });

  it('drops the promotion being edited', () => {
    expect(isHeaderCandidate(req, existing({ id: 10 }), 10)).toBeFalse();
    expect(isHeaderCandidate(req, existing({ id: 11 }), 10)).toBeTrue();
  });

  it('drops an INACTIVE promotion', () => {
    expect(isHeaderCandidate(req, existing({ promotionStatus: 'INACTIVE' }))).toBeFalse();
  });

  // §1.22: the rule settles inside one group and never reaches across
  it('drops a spend bundle when saving a set bundle, and the other way round', () => {
    expect(isHeaderCandidate(req, existing({ thresholdType: 'BUNDLESUBTOTAL' }))).toBeFalse();
    const spend = request({ thresholdType: 'BUNDLESUBTOTAL', action: 'BUNDLEBATHDISC' });
    expect(isHeaderCandidate(spend, existing())).toBeFalse();
    expect(isHeaderCandidate(spend, existing({ thresholdType: 'BUNDLESUBTOTAL' }))).toBeTrue();
  });

  it('drops an ITEM promotion on the same good', () => {
    expect(isHeaderCandidate(req, existing({ promotionType: 'ITEM', thresholdType: 'ITEMEXIST', action: 'ITEMPRICE' }))).toBeFalse();
  });

  it('drops a GIFT or PWP bundle', () => {
    expect(isHeaderCandidate(req, existing({ action: 'GIFT' }))).toBeFalse();
    expect(isHeaderCandidate(req, existing({ action: 'PWP' }))).toBeFalse();
  });

  it('compares dates by day, last day inclusive, ignoring the stored time part', () => {
    expect(isHeaderCandidate(req, existing({ startdate: '2026-10-31T00:00:00', enddate: '2026-12-01T00:00:00' }))).toBeTrue();
    expect(isHeaderCandidate(req, existing({ startdate: '2026-11-01T00:00:00', enddate: '2026-12-01T00:00:00' }))).toBeFalse();
    expect(isHeaderCandidate(req, existing({ startdate: '2026-09-01T00:00:00', enddate: '2026-09-30T23:59:59' }))).toBeFalse();
  });
});

describe('promotion-overlap: scope', () => {
  it('days: disjoint masks never meet, a missing mask means every day', () => {
    expect(daysIntersect('1111100', '0000011')).toBeFalse();
    expect(daysIntersect('1111100', '0000111')).toBeTrue();
    expect(daysIntersect('0000011', '')).toBeTrue();
    expect(daysIntersect(undefined, '0000011')).toBeTrue();
  });

  it('times: only two limited windows can be disjoint', () => {
    const w = (startTime: string, endTime: string, limitTime = true) => ({ limitTime, startTime, endTime });
    expect(timesIntersect(w('09:00:00', '12:00:00'), w('12:00:00', '18:00:00'))).toBeFalse();
    expect(timesIntersect(w('09:00:00', '12:30:00'), w('12:00:00', '18:00:00'))).toBeTrue();
    expect(timesIntersect(w('09:00:00', '12:00:00'), w('12:00:00', '18:00:00', false))).toBeTrue();
    // an end at or before the start is not understood: read as the whole day
    expect(timesIntersect(w('09:00:00', '00:00:00'), w('12:00:00', '18:00:00'))).toBeTrue();
  });

  it('members: both specific with no member in common never meet', () => {
    const req = request({ isMemberSpecific: true, members: [1, 2] });
    const vip = { id: 3, memberName: 'VIP', custType: '3' };
    expect(resolveOverlap(req, existing({ isMemberSpecific: true, members: [vip] }))).toBeNull();
    expect(resolveOverlap(req, existing({ isMemberSpecific: true, members: [{ ...vip, id: 2 }] }))).not.toBeNull();
    expect(resolveOverlap(req, existing({ isMemberSpecific: false, members: [] }))).not.toBeNull();
  });

  it('branches: unknown until the list is loaded, then by branch code', () => {
    const req = request({ isBranchSpecific: true, branches: ['B01'] });
    const unloaded = existing({ isBranchSpecific: true });
    expect(branchesIntersect(req, unloaded)).toBeNull();
    expect(needsBranchList(req, unloaded)).toBeTrue();
    expect(needsBranchList(req, existing({ isBranchSpecific: false }))).toBeFalse();
    expect(needsBranchList(request(), unloaded)).toBeFalse();

    const other = existing({ isBranchSpecific: true, branches: [{ branchCode: 'B02', branchName: '' }] });
    expect(resolveOverlap(req, other)).toBeNull();
    const same = existing({ isBranchSpecific: true, branches: [{ branchCode: 'B01', branchName: '' }] });
    expect(resolveOverlap(req, same)).not.toBeNull();
  });

  // Guessing "no overlap" is the one wrong answer the check exists to prevent
  it('branches: an unloaded list is read as overlapping', () => {
    const req = request({ isBranchSpecific: true, branches: ['B01'] });
    expect(resolveOverlap(req, existing({ isBranchSpecific: true }))).not.toBeNull();
  });
});

describe('promotion-overlap: products', () => {
  it('matches the pair (goodCode, unitCode), across any of the groups', () => {
    const req = request({ filterList: [
      { filterType: 'COUNT', filterValue: 1, productList: ['A'], products: [ref('A', 'U1')] },
      { filterType: 'COUNT', filterValue: 1, productList: ['B'], products: [ref('B', 'U1')] },
    ] });
    const live = existing({ filterList: [
      { filterType: 'COUNT', filterValue: 1, productList: [good('B', 'U1'), good('C')] },
    ] });
    expect(sharedProducts(req, live).map((p) => p.goodCode)).toEqual(['B']);
  });

  it('the same good in another unit is another product', () => {
    const live = existing({ filterList: [{ filterType: 'COUNT', filterValue: 1, productList: [good('A', 'U2')] }] });
    expect(sharedProducts(request(), live)).toEqual([]);
  });

  it('a stored row with no unit yet overlaps every unit of its good', () => {
    const live = existing({ filterList: [{ filterType: 'COUNT', filterValue: 1, productList: [good('A', null)] }] });
    expect(sharedProducts(request(), live).length).toBe(1);
  });

  it('no shared product, no overlap', () => {
    const live = existing({ filterList: [{ filterType: 'COUNT', filterValue: 1, productList: [good('Z')] }] });
    expect(resolveOverlap(request(), live)).toBeNull();
  });
});

describe('promotion-overlap: outcome (§1.22, §1.23)', () => {
  it('same non-zero priority is a COLLISION: the level yields nothing', () => {
    const o = resolveOverlap(request({ promotionPriority: 2 }), existing({ promotionPriority: 2 }));
    expect(o?.outcome).toBe('COLLISION');
  });

  it('different priorities, one above 0: the higher one settles the group', () => {
    expect(resolveOverlap(request({ promotionPriority: 1 }), existing({ promotionPriority: 3 })))
      .toEqual(jasmine.objectContaining({ outcome: 'EXCLUSIVE', existingFirst: true }));
    expect(resolveOverlap(request({ promotionPriority: 3 }), existing({ promotionPriority: 1 })))
      .toEqual(jasmine.objectContaining({ outcome: 'EXCLUSIVE', existingFirst: false }));
    // a level above 0 that fires skips the open tier too ("zeros included")
    expect(resolveOverlap(request({ promotionPriority: 0 }), existing({ promotionPriority: 1 })))
      .toEqual(jasmine.objectContaining({ outcome: 'EXCLUSIVE', existingFirst: true }));
    expect(resolveOverlap(request({ promotionPriority: 1 }), existing({ promotionPriority: 0 })))
      .toEqual(jasmine.objectContaining({ outcome: 'EXCLUSIVE', existingFirst: false }));
  });

  it('both at 0, set bundles: units are shared in run order, order descending', () => {
    expect(resolveOverlap(request({ promotionOrder: 1 }), existing({ promotionOrder: 3 })))
      .toEqual(jasmine.objectContaining({ outcome: 'SHARES_UNITS', existingFirst: true }));
    expect(resolveOverlap(request({ promotionOrder: 3 }), existing({ promotionOrder: 1 })))
      .toEqual(jasmine.objectContaining({ outcome: 'SHARES_UNITS', existingFirst: false }));
  });

  it('equal order: the lower id runs first, and a new promotion is the newest', () => {
    expect(resolveOverlap(request(), existing({ id: 10 }))?.existingFirst).toBeTrue();
    expect(resolveOverlap(request(), existing({ id: 10 }), 5)?.existingFirst).toBeFalse();
    expect(resolveOverlap(request(), existing({ id: 10 }), 20)?.existingFirst).toBeTrue();
  });

  it('both at 0, spend bundles: nothing is consumed, the discounts STACK', () => {
    const req = request({ thresholdType: 'BUNDLESUBTOTAL', action: 'BUNDLEBATHDISC',
      filterList: [{ filterType: 'EXIST', filterValue: 1, productList: ['A'], products: [ref('A')] }] });
    const live = existing({ thresholdType: 'BUNDLESUBTOTAL', action: 'BUNDLEPERCENTDISC',
      filterList: [{ filterType: 'EXIST', filterValue: 1, productList: [good('A')] }] });
    expect(resolveOverlap(req, live)?.outcome).toBe('STACKS');
  });

  it('reports collisions first and blocks on any', () => {
    const report = resolveOverlaps(request({ promotionPriority: 1 }), [
      existing({ id: 3, promotionPriority: 0 }),
      existing({ id: 2, promotionPriority: 1 }),
      existing({ id: 1, promotionPriority: 0, filterList: [{ filterType: 'COUNT', filterValue: 1, productList: [good('Z')] }] }),
    ]);
    expect(report.blocking).toBeTrue();
    expect(report.overlaps.map((o) => [o.existing.id, o.outcome])).toEqual([[2, 'COLLISION'], [3, 'EXCLUSIVE']]);
  });

  it('is empty, not blocking, when nothing overlaps', () => {
    expect(resolveOverlaps(request(), [existing({ promotionStatus: 'INACTIVE' })])).toEqual({ overlaps: [], blocking: false });
  });
});
