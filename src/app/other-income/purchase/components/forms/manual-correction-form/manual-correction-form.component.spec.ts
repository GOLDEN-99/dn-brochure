import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManualCorrectionFormComponent } from './manual-correction-form.component';
import { TPostManualCorrectionReq } from '../../../../shared/types/other-income.type';

describe('ManualCorrectionFormComponent', () => {
  let component: ManualCorrectionFormComponent;
  let fixture: ComponentFixture<ManualCorrectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualCorrectionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManualCorrectionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contractId', 1);
    fixture.componentRef.setInput('contractType', 'ORDER');
    fixture.detectChanges();
  });

  it('creates with amount 0 invalid by default (a zero correction is a no-op)', () => {
    expect(component).toBeTruthy();
    expect(component.canSubmit()).toBe(false);
  });

  it('rejects a zero amount', () => {
    component.manualCorrectionForm.orderAmount().value.set(0);
    expect(component.manualCorrectionForm().valid()).toBe(false);
    expect(component.canSubmit()).toBe(false);
  });

  it('rejects a negative amount (must be a positive magnitude, like CN/lag)', () => {
    component.manualCorrectionForm.orderAmount().value.set(-500);
    expect(component.manualCorrectionForm().valid()).toBe(false);
    expect(component.canSubmit()).toBe(false);
  });

  it('blocks submit while submitting is true even with a valid amount', () => {
    fixture.componentRef.setInput('submitting', true);
    component.manualCorrectionForm.orderAmount().value.set(100);
    expect(component.canSubmit()).toBe(false);
  });

  // API contract (docs/api/income-entry-api.md, POST /v2/income-entries/correction):
  // for contractType 'ORDER', the caller must send a signed `orderAmount` delta;
  // `amount` is ignored server-side and computed from `orderAmount` instead
  // (income = bracket delta via the same cumulative calc as settlement/CN
  // correction). Only BRANCH/PROMO send `amount` directly.
  it('emits orderAmount (not amount) for ORDER contracts, per the current API contract', () => {
    let emitted: TPostManualCorrectionReq | undefined;
    component.submitCorrection.subscribe((req) => (emitted = req));

    component.manualCorrectionForm.orderAmount().value.set(10000);
    component.manualCorrectionForm.month().value.set({ year: 2026, month: 1, day: 1 });
    component.onSubmit();

    expect(emitted).toEqual({
      contractId: 1,
      contractType: 'ORDER',
      month: '2026-01-01',
      orderAmount: 10000,
      note: undefined,
    });
  });

  it('emits amount (not orderAmount) for BRANCH/PROMO contracts', () => {
    fixture.componentRef.setInput('contractType', 'PROMO');
    fixture.detectChanges();

    let emitted: TPostManualCorrectionReq | undefined;
    component.submitCorrection.subscribe((req) => (emitted = req));

    component.manualCorrectionForm.amount().value.set(500);
    component.manualCorrectionForm.month().value.set({ year: 2026, month: 2, day: 1 });
    component.onSubmit();

    expect(emitted).toEqual({
      contractId: 1,
      contractType: 'PROMO',
      month: '2026-02-01',
      amount: 500,
      note: undefined,
    });
  });

  it('includes note when provided', () => {
    let emitted: TPostManualCorrectionReq | undefined;
    component.submitCorrection.subscribe((req) => (emitted = req));

    component.manualCorrectionForm.orderAmount().value.set(100);
    component.manualCorrectionForm.note().value.set('adjustment for Q1');
    component.onSubmit();

    expect(emitted?.note).toBe('adjustment for Q1');
  });

  it('does not emit when submit is attempted while submitting is true', () => {
    let emitted: TPostManualCorrectionReq | undefined;
    component.submitCorrection.subscribe((req) => (emitted = req));
    fixture.componentRef.setInput('submitting', true);

    component.onSubmit();

    expect(emitted).toBeUndefined();
  });

  it('reset() restores amount to 0, note to empty, and month to today at day 1', () => {
    component.manualCorrectionForm.orderAmount().value.set(999);
    component.manualCorrectionForm.note().value.set('temp');

    component.reset();

    expect(component.manualCorrectionForm.orderAmount().value()).toBe(0);
    expect(component.manualCorrectionForm.note().value()).toBe('');
  });
});
