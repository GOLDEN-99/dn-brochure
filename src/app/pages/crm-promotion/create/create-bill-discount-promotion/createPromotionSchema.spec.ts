import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import {
  createPromotionSchema,
  initialMaster,
  initialDatetime,
  initialMember,
  initialBranch,
  initialBenefit,
  TCreatePromotionForm,
} from './createPromotionSchema';
import {
  TPromotionBenefit,
  TPromotionFilterState,
} from '../../../../types/crm-promotion.type';
import { CHEAPEST_ACTION } from '../../../../lib/crm-promotion/promotion-actions';

// The schema is the only guard on these values — the API does not validate the
// promotion body — so these specs assert on validity, not on UI wiring.
function validityOf(
  benefit: Partial<TPromotionBenefit>,
  opts: { promotionType?: string; filter?: TPromotionFilterState[] } = {},
) {
  return TestBed.runInInjectionContext(() => {
    const model = signal<TCreatePromotionForm>({
      promotionMaster: {
        ...initialMaster,
        promotionName: 'ทดสอบ',
        promotionType: opts.promotionType ?? 'BILL',
      },
      promotionDatetime: initialDatetime,
      promotionMember: initialMember,
      promotionBranch: initialBranch,
      promotionFilter: opts.filter ?? [],
      promotionBenefit: { ...initialBenefit, ...benefit },
    });
    const f = form(model, createPromotionSchema);
    const kinds = (errs: readonly { kind: string }[]) => errs.map((e) => e.kind);
    return {
      benefitValid: f.promotionBenefit().valid(),
      errors: kinds(f.promotionBenefit().errors()),
      tierErrors: kinds(f.promotionBenefit.tiers().errors()),
      thresholdErrors: kinds(
        f.promotionBenefit.tiers[0].thresholdValue().errors(),
      ),
      rewardErrors: kinds(f.promotionBenefit.tiers[0].rewardValue().errors()),
    };
  });
}

const bundleFilter: TPromotionFilterState[] = [
  {
    filterType: 'COUNT',
    filterValue: 1,
    productList: [{ goodCode: 'A1', goodName: 'ยา A', sku: '1' }],
  },
];

// A BUNDLE promotion needs a filter group, so these two travel together.
const asBundle = { promotionType: 'BUNDLE', filter: bundleFilter };

describe('createPromotionSchema — threshold floor per thresholdType', () => {
  // The reported bug: a BUNDLECOUNT of 0 means "every 0 sets", which an empty
  // basket satisfies, repeatedly and without bound.
  it('rejects a BUNDLECOUNT threshold of 0', () => {
    const r = validityOf(
      {
        action: 'BUNDLEBATHDISC',
        thresholdType: 'BUNDLECOUNT',
        isRepeat: true,
        tiers: [{ thresholdValue: 0, rewardValue: 10 }],
      },
      asBundle,
    );
    expect(r.benefitValid).toBeFalse();
    expect(r.thresholdErrors).toContain('threshold below minimum');
  });

  it('accepts a BUNDLECOUNT threshold of 1', () => {
    const r = validityOf(
      {
        action: 'BUNDLEBATHDISC',
        thresholdType: 'BUNDLECOUNT',
        isRepeat: true,
        tiers: [{ thresholdValue: 1, rewardValue: 10 }],
      },
      asBundle,
    );
    expect(r.benefitValid).toBeTrue();
  });

  it('rejects a fractional BUNDLECOUNT — half a set cannot be bought', () => {
    const r = validityOf(
      {
        action: 'BUNDLEBATHDISC',
        thresholdType: 'BUNDLECOUNT',
        isRepeat: true,
        tiers: [{ thresholdValue: 2.5, rewardValue: 10 }],
      },
      asBundle,
    );
    expect(r.thresholdErrors).toContain('threshold not an integer');
  });

  it('rejects a BILLCOUNT threshold of 0', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLCOUNT',
      isRepeat: false,
      tiers: [{ thresholdValue: 0, rewardValue: 10 }],
    });
    expect(r.thresholdErrors).toContain('threshold below minimum');
  });

  // The one case where 0 is the author's real intent: a bill discount with no
  // minimum spend. A blanket min(1) would have broken this.
  it('accepts a BILLSUBTOTAL threshold of 0 — "no minimum"', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 0, rewardValue: 50 }],
    });
    expect(r.benefitValid).toBeTrue();
  });

  it('accepts a fractional BILLSUBTOTAL — baht have satang', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 1500.5, rewardValue: 50 }],
    });
    expect(r.benefitValid).toBeTrue();
  });
});

describe('createPromotionSchema — repeating rung', () => {
  // BILLSUBTOTAL 0 is legal on a one-shot tier but not on a repeating one, where
  // it divides into the basket an unbounded number of times.
  it('rejects a 0 threshold when isRepeat is true, even for BILLSUBTOTAL', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: true,
      tiers: [{ thresholdValue: 0, rewardValue: 50 }],
    });
    expect(r.errors).toContain('zero threshold on repeat');
  });

  it('allows a 0 threshold when isRepeat is false', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 0, rewardValue: 50 }],
    });
    expect(r.errors).not.toContain('zero threshold on repeat');
  });
});

describe('createPromotionSchema — reward floor per action', () => {
  it('rejects a 0-baht discount — the promotion would do nothing', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 100, rewardValue: 0 }],
    });
    expect(r.benefitValid).toBeFalse();
  });

  it('rejects a 0% discount', () => {
    const r = validityOf({
      action: 'BILLPERCENTDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 100, rewardValue: 0 }],
    });
    expect(r.benefitValid).toBeFalse();
  });

  it('still caps a percent discount at 100', () => {
    const r = validityOf({
      action: 'BILLPERCENTDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 100, rewardValue: 101 }],
    });
    expect(r.benefitValid).toBeFalse();
  });

  // PRICE sets an absolute price rather than deducting, so 0 means "free" and is
  // a legitimate authoring choice.
  it('accepts a 0 reward for a PRICE action — the item becomes free', () => {
    const r = validityOf(
      {
        action: 'BUNDLEPRICE',
        thresholdType: 'BUNDLECOUNT',
        isRepeat: true,
        tiers: [{ thresholdValue: 1, rewardValue: 0 }],
      },
      asBundle,
    );
    expect(r.benefitValid).toBeTrue();
  });

  it('keeps the CHEAPEST integer rule', () => {
    const r = validityOf(
      {
        action: CHEAPEST_ACTION,
        thresholdType: 'BUNDLECOUNT',
        isRepeat: true,
        tiers: [{ thresholdValue: 1, rewardValue: 1.5 }],
      },
      asBundle,
    );
    expect(r.rewardErrors).toContain('not an integer');
  });

  it('keeps the CHEAPEST min-1 rule', () => {
    const r = validityOf(
      {
        action: CHEAPEST_ACTION,
        thresholdType: 'BUNDLECOUNT',
        isRepeat: true,
        tiers: [{ thresholdValue: 1, rewardValue: 0 }],
      },
      asBundle,
    );
    expect(r.benefitValid).toBeFalse();
  });
});

describe('createPromotionSchema — pool-only actions', () => {
  const pool = [
    {
      goodCode: 'A1',
      goodName: 'ยา A',
      sku: '1',
      itemBenefitType: 'PRICE',
      itemBenefitValue: 0,
    },
  ];

  // The benefit is the pool; the tier's reward number carries no meaning, so it
  // must not be demanded of the author nor block submit at 0.
  it('does not require a tier reward for GIFT', () => {
    const r = validityOf({
      action: 'GIFT',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 500, rewardValue: 0 }],
      rewardPool: pool,
    });
    expect(r.benefitValid).toBeTrue();
  });

  it('does not require a tier reward for PWP', () => {
    const r = validityOf({
      action: 'PWP',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 500, rewardValue: 0 }],
      rewardPool: pool,
    });
    expect(r.benefitValid).toBeTrue();
  });

  it('still requires a non-empty pool for PWP', () => {
    const r = validityOf({
      action: 'PWP',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [{ thresholdValue: 500, rewardValue: 0 }],
      rewardPool: [],
    });
    expect(r.benefitValid).toBeFalse();
  });
});

describe('createPromotionSchema — reward pool item values', () => {
  const poolItem = (itemBenefitType: string, itemBenefitValue: number) => ({
    action: 'PWP',
    thresholdType: 'BILLSUBTOTAL',
    isRepeat: false,
    tiers: [{ thresholdValue: 500, rewardValue: 0 }],
    rewardPool: [
      {
        goodCode: 'A1',
        goodName: 'ยา A',
        sku: '1',
        itemBenefitType,
        itemBenefitValue,
      },
    ],
  });

  // promotionRewardPercentSchema existed but was never applied, and tested for
  // 'PERCENT' where the picker sets 'PERCENTDISC'. A 250% discount shipped clean.
  it('caps a PERCENTDISC pool item at 100', () => {
    expect(validityOf(poolItem('PERCENTDISC', 250)).benefitValid).toBeFalse();
  });

  it('accepts a PERCENTDISC pool item at 100', () => {
    expect(validityOf(poolItem('PERCENTDISC', 100)).benefitValid).toBeTrue();
  });

  it('rejects a negative pool item value', () => {
    expect(validityOf(poolItem('BATHDISC', -10)).benefitValid).toBeFalse();
  });

  // A BATHDISC over 100 is fine — that is baht, not percent.
  it('does not cap a BATHDISC pool item at 100', () => {
    expect(validityOf(poolItem('BATHDISC', 250)).benefitValid).toBeTrue();
  });

  it('accepts a PRICE pool item at 0 — the item is free', () => {
    expect(validityOf(poolItem('PRICE', 0)).benefitValid).toBeTrue();
  });
});

describe('createPromotionSchema — ladder ordering', () => {
  it('rejects a ladder where a higher threshold rewards less', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [
        { thresholdValue: 100, rewardValue: 50 },
        { thresholdValue: 200, rewardValue: 10 },
      ],
    });
    expect(r.tierErrors).toContain('non monotonic tiers');
  });

  it('accepts an ascending ladder', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [
        { thresholdValue: 100, rewardValue: 10 },
        { thresholdValue: 200, rewardValue: 50 },
      ],
    });
    expect(r.benefitValid).toBeTrue();
  });

  // The check sorts by threshold first, so authoring order must not matter.
  it('accepts an ascending ladder given out of order', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [
        { thresholdValue: 200, rewardValue: 50 },
        { thresholdValue: 100, rewardValue: 10 },
      ],
    });
    expect(r.tierErrors).not.toContain('non monotonic tiers');
  });

  // A PRICE ladder inverts: more sets should mean a lower price per set.
  it('does not apply monotonicity to PRICE actions', () => {
    const r = validityOf(
      {
        action: 'BUNDLEPRICE',
        thresholdType: 'BUNDLECOUNT',
        isRepeat: false,
        tiers: [
          { thresholdValue: 1, rewardValue: 100 },
          { thresholdValue: 2, rewardValue: 90 },
        ],
      },
      asBundle,
    );
    expect(r.tierErrors).not.toContain('non monotonic tiers');
  });

  it('keeps the existing threshold distinctness rule', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [
        { thresholdValue: 100, rewardValue: 10 },
        { thresholdValue: 100, rewardValue: 20 },
      ],
    });
    expect(r.tierErrors).toContain('duplicate threshold value');
  });

  it('keeps the existing reward distinctness rule', () => {
    const r = validityOf({
      action: 'BILLBATHDISC',
      thresholdType: 'BILLSUBTOTAL',
      isRepeat: false,
      tiers: [
        { thresholdValue: 100, rewardValue: 10 },
        { thresholdValue: 200, rewardValue: 10 },
      ],
    });
    expect(r.tierErrors).toContain('duplicate reward value');
  });
});
