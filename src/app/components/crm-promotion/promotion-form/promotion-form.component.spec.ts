import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PromotionFormComponent } from './promotion-form.component';
import { CRM_PAGE_CONFIG } from '../../../service/crm-promotion/crm-token';
import { provideCreatePromotionConfig } from '../../../factory/crm-promotion/create-promotion';
import {
  CHEAPEST_ACTION,
  REGISTER_FEE_ACTION,
  REGISTER_FEE_GOOD_CODE,
} from '../../../lib/crm-promotion/promotion-actions';
import { TCreatePromotionRequest } from '../../../types/crm-promotion.type';

// The request built for a given page — this is the seam where a reward pool has
// historically been dropped without a trace, so assert on the payload, not the form.
function requestFor(path: string): TCreatePromotionRequest {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: CRM_PAGE_CONFIG, useValue: provideCreatePromotionConfig(path) },
    ],
  });
  const fixture = TestBed.createComponent(PromotionFormComponent);
  const component = fixture.componentInstance;

  let emitted: TCreatePromotionRequest | undefined;
  component.submitted.subscribe((r) => (emitted = r));
  component.onSubmit();

  if (!emitted) throw new Error('form did not emit a request');
  return emitted;
}

describe('PromotionFormComponent payload', () => {
  describe('ค่าสมาชิก (REGISTERFEE)', () => {
    it('carries the register-fee SKU at 0 baht', () => {
      // The whole promotion is this one line: the POS reads it to promote the customer
      // to HUG Club. An empty pool here is a promotion that does nothing at the till,
      // saved without an error anywhere.
      const req = requestFor('create-register-fee');

      expect(req.action).toBe(REGISTER_FEE_ACTION);
      expect(req.rewardPool).toEqual([
        {
          goodCode: REGISTER_FEE_GOOD_CODE,
          itemBenefitType: 'PRICE',
          itemBenefitValue: 0,
        },
      ]);
    });

    it('is a BILL promotion with a single tier', () => {
      const req = requestFor('create-register-fee');

      expect(req.promotionType).toBe('BILL');
      expect(req.thresholdType).toBe('BILLSUBTOTAL');
      expect(req.isRepeat).toBeFalse();
      expect(req.tiers.length).toBe(1);
    });
  });

  describe('แถมในกลุ่ม (CHEAPEST)', () => {
    it('sends no reward pool — the reward is a count, not a SKU list', () => {
      const req = requestFor('create-cheapest');

      expect(req.action).toBe(CHEAPEST_ACTION);
      expect(req.rewardPool).toEqual([]);
    });

    it('pins the threshold to one set and repeats', () => {
      const req = requestFor('create-cheapest');

      expect(req.promotionType).toBe('BUNDLE');
      expect(req.thresholdType).toBe('BUNDLECOUNT');
      expect(req.isRepeat).toBeTrue();
      expect(req.tiers).toEqual([{ thresholdValue: 1, rewardValue: 1 }]);
    });
  });

  it('still strips the pool from a plain discount promotion', () => {
    const req = requestFor('create-bill');

    expect(req.action).toBe('BILLBATHDISC');
    expect(req.rewardPool).toEqual([]);
  });
});
