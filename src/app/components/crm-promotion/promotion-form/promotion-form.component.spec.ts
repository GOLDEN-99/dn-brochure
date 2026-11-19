import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PromotionFormComponent } from './promotion-form.component';
import { CRM_PAGE_CONFIG } from '../../../service/crm-promotion/crm-token';
import { provideCreatePromotionConfig } from '../../../factory/crm-promotion/create-promotion';
import {
  CHEAPEST_ACTION,
  REGISTER_FEE_ACTION,
  REGISTER_FEE_GOOD_CODE,
  REGISTER_FEE_UNIT_CODE,
} from '../../../lib/crm-promotion/promotion-actions';
import { TCreatePromotionRequest } from '../../../types/crm-promotion.type';
import { ComponentFixture } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { PromotionOverlapService } from '../../../service/crm-promotion/promotion-overlap.service';
import { EMPTY_OVERLAP_REPORT, OverlapReport } from '../../../lib/crm-promotion/promotion-overlap';
import { PromotionOverlapModalComponent } from '../promotion-overlap-modal/promotion-overlap-modal.component';

// The pre-save overlap check answers "nothing live" unless a test says otherwise, so the
// payload tests below stay synchronous and about the payload.
const noOverlaps = { check: () => of(EMPTY_OVERLAP_REPORT) };

function fixtureFor(path: string): ComponentFixture<PromotionFormComponent> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      { provide: CRM_PAGE_CONFIG, useValue: provideCreatePromotionConfig(path) },
      { provide: PromotionOverlapService, useValue: noOverlaps },
    ],
  });
  return TestBed.createComponent(PromotionFormComponent);
}

function summaryPaths(fixture: ComponentFixture<PromotionFormComponent>): string[] {
  fixture.detectChanges();
  const items = fixture.nativeElement.querySelectorAll(
    '[data-testid="validation-summary-item"]',
  ) as NodeListOf<HTMLElement>;
  return Array.from(items).map((li) => li.dataset['path'] ?? '');
}

// The request built for a given page — this is the seam where a reward pool has
// historically been dropped without a trace, so assert on the payload, not the form.
function requestFor(path: string): TCreatePromotionRequest {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      { provide: CRM_PAGE_CONFIG, useValue: provideCreatePromotionConfig(path) },
      { provide: PromotionOverlapService, useValue: noOverlaps },
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
          unitCode: REGISTER_FEE_UNIT_CODE,
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

describe('PromotionFormComponent submit gate', () => {
  describe('ลดรายสินค้า (ITEM)', () => {
    // 2026-09-30: every ITEM create/edit was disabled with no message. The
    // "zero threshold on repeat" rule fired on the ITEM seed (threshold 0, isRepeat
    // true, which is how every ITEM promotion is authored) and hung on
    // promotionBenefit -- a node the inline page renders no alert for.
    it('is submittable once a product and a reward are filled in', () => {
      const fixture = fixtureFor('create-inline');
      const c = fixture.componentInstance;
      c.onMasterChange('promotionName', 'ลด 5 บาท');
      c.onChangeFilter(
        {
          filterType: 'EXIST',
          filterValue: 1,
          productList: [{ goodCode: 'A1', goodName: 'ยา A', sku: '1' }],
        },
        0,
      );
      c.onBenefitChange({ tiers: [{ thresholdValue: 0, rewardValue: 5 }] });

      expect(summaryPaths(fixture)).toEqual([]);
      expect(c.canSubmit()).toBeTrue();
    });

    it('lists every blocking rule above the button, including ones no field alert shows', () => {
      const fixture = fixtureFor('create-inline');
      const paths = summaryPaths(fixture);

      // The seed's zeros: no name, no product, a 0 reward.
      expect(paths).toContain('promotionMaster.promotionName');
      expect(paths).toContain('promotionFilter.0.productList');
      expect(paths).toContain('promotionBenefit.tiers.0.rewardValue');
      // The summary is what makes a rule on a section node visible on this page.
      expect(paths).not.toContain('promotionBenefit');
      expect(fixture.componentInstance.canSubmit()).toBeFalse();
    });
  });

  describe('ค่าสมาชิก (REGISTERFEE)', () => {
    // Same 2026-09-30 class: the reward floor rejected the page's always-0 reward, and the
    // page hides that box, so nothing on screen said why.
    it('is submittable with just a name and a bill minimum', () => {
      const fixture = fixtureFor('create-register-fee');
      const c = fixture.componentInstance;
      c.onMasterChange('promotionName', 'สมัครฟรีเมื่อซื้อครบ 1000');
      c.onBenefitChange({ tiers: [{ thresholdValue: 1000, rewardValue: 0 }] });

      expect(summaryPaths(fixture)).toEqual([]);
      expect(c.canSubmit()).toBeTrue();
    });
  });

  it('shows a rule that hangs on a section node, with the section named', () => {
    // A BILL page with a repeating tier at threshold 0: the rule is real there, and it
    // hangs on promotionBenefit, which only the summary renders.
    const fixture = fixtureFor('create-bill');
    const c = fixture.componentInstance;
    c.onMasterChange('promotionName', 'ทดสอบ');
    c.onBenefitChange({
      isRepeat: true,
      tiers: [{ thresholdValue: 0, rewardValue: 10 }],
    });

    expect(summaryPaths(fixture)).toContain('promotionBenefit');
    const text = fixture.nativeElement.querySelector(
      '[data-testid="validation-summary"]',
    ).textContent as string;
    expect(text).toContain('สิทธิประโยชน์');
    expect(text).toContain('สิทธิประโยชน์แบบซ้ำ/ทุกๆ ต้องมีจำนวนขั้นต่ำมากกว่า 0');
  });

  it('renders nothing once the form is valid', () => {
    const fixture = fixtureFor('create-bill');
    const c = fixture.componentInstance;
    c.onMasterChange('promotionName', 'ทดสอบ');
    c.onBenefitChange({ tiers: [{ thresholdValue: 0, rewardValue: 10 }] });

    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-testid="validation-summary"]'),
    ).toBeNull();
    expect(c.canSubmit()).toBeTrue();
  });
});


describe('PromotionFormComponent pre-save overlap check', () => {
  const overlap = (outcome: OverlapReport['overlaps'][number]['outcome']): OverlapReport => ({
    blocking: outcome === 'COLLISION',
    overlaps: [{
      outcome, existingFirst: true, sharedProducts: [],
      existing: {
        id: 10, promotionName: 'live', promotionDesc: '', promotionType: 'BUNDLE', source: null,
        action: 'BUNDLEBATHDISC', thresholdType: 'BUNDLECOUNT', isRepeat: true,
        isBranchSpecific: false, isMemberSpecific: false,
        startdate: '2026-10-01', enddate: '2026-10-31', limitTime: false, startTime: '', endTime: '',
        activeDays: '1111111', promotionStatus: 'ACTIVE', promotionPriority: 0, promotionOrder: 0,
        tiers: [], filterList: [], rewardPool: [], members: [],
      },
    }],
  });

  // Stands in for the modal instance: the form sets `report` on it
  class FakeModal {
    value: OverlapReport | null | undefined = undefined;
    report = { set: (v: OverlapReport | null) => { this.value = v; } };
  }

  // `answer` is what the modal resolved: `true` from the confirm button, a rejection from cancel
  function setup(path: string, check: PromotionOverlapService['check'], answer: Promise<unknown>) {
    const modalRef = { componentInstance: new FakeModal(), result: answer };
    const modal = jasmine.createSpyObj<NgbModal>('NgbModal', ['open']);
    modal.open.and.returnValue(modalRef as never);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: CRM_PAGE_CONFIG, useValue: provideCreatePromotionConfig(path) },
        { provide: PromotionOverlapService, useValue: { check } },
        { provide: NgbModal, useValue: modal },
      ],
    });
    const fixture = TestBed.createComponent(PromotionFormComponent);
    const c = fixture.componentInstance;
    const emitted: TCreatePromotionRequest[] = [];
    c.submitted.subscribe((r) => emitted.push(r));
    return { fixture, c, modal, modalRef, emitted };
  }

  it('saves a BILL promotion without asking', () => {
    const check = jasmine.createSpy('check').and.returnValue(of(EMPTY_OVERLAP_REPORT));
    const { c, modal, emitted } = setup('create-bill', check, Promise.resolve(true));
    c.onSubmit();
    expect(check).not.toHaveBeenCalled();
    expect(modal.open).not.toHaveBeenCalled();
    expect(emitted.length).toBe(1);
  });

  it('saves a BUNDLE promotion straight away when nothing overlaps', () => {
    const check = jasmine.createSpy('check').and.returnValue(of(EMPTY_OVERLAP_REPORT));
    const { c, modal, emitted } = setup('create-cheapest', check, Promise.resolve(true));
    c.onSubmit();
    expect(check).toHaveBeenCalledWith(jasmine.objectContaining({ promotionType: 'BUNDLE' }), undefined);
    expect(modal.open).not.toHaveBeenCalled();
    expect(emitted.length).toBe(1);
    expect(c.checking()).toBeFalse();
  });

  it('passes the id being edited to the check', () => {
    const check = jasmine.createSpy('check').and.returnValue(of(EMPTY_OVERLAP_REPORT));
    const { fixture, c } = setup('create-cheapest', check, Promise.resolve(true));
    fixture.componentRef.setInput('editingId', 42);
    c.onSubmit();
    expect(check).toHaveBeenCalledWith(jasmine.anything(), 42);
  });

  it('asks, then saves on confirm', async () => {
    const check = () => of(overlap('SHARES_UNITS'));
    const { c, modal, modalRef, emitted } = setup('create-cheapest', check, Promise.resolve(true));
    c.onSubmit();
    expect(modal.open).toHaveBeenCalledWith(PromotionOverlapModalComponent, jasmine.objectContaining({ backdrop: 'static' }));
    expect(modalRef.componentInstance.value?.overlaps.length).toBe(1);
    await modalRef.result;
    await Promise.resolve();
    expect(emitted.length).toBe(1);
  });

  it('asks, and does not save on cancel', async () => {
    const check = () => of(overlap('EXCLUSIVE'));
    const answer = Promise.reject(new Error('cancel'));
    const { c, emitted } = setup('create-cheapest', check, answer);
    c.onSubmit();
    await answer.catch(() => undefined);
    await Promise.resolve();
    expect(emitted.length).toBe(0);
  });

  // The modal has no confirm button on a blocking report; the form also saves on nothing
  // but an explicit `true`
  it('never saves a COLLISION, whatever the modal returns', async () => {
    const check = () => of(overlap('COLLISION'));
    const answer = Promise.resolve(undefined);
    const { c, emitted, modalRef } = setup('create-cheapest', check, answer);
    c.onSubmit();
    expect(modalRef.componentInstance.value?.blocking).toBeTrue();
    await answer;
    await Promise.resolve();
    expect(emitted.length).toBe(0);
  });

  it('reports a failed check and lets the author decide', async () => {
    const check = () => throwError(() => new Error('down'));
    const { c, modalRef, emitted } = setup('create-cheapest', check, Promise.resolve(true));
    c.onSubmit();
    expect(modalRef.componentInstance.value).toBeNull();
    expect(c.checking()).toBeFalse();
    await modalRef.result;
    await Promise.resolve();
    expect(emitted.length).toBe(1);
  });
});
