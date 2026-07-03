import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LagCorrectionFormComponent } from './lag-correction-form.component';
import { TPostLagCorrectionReq } from '../../../../shared/types/other-income.type';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeSearchOrderService, TSearchOrderResult } from '../../../services/other-income-search-order.service';
import { firstValueFrom, of } from 'rxjs';

describe('LagCorrectionFormComponent', () => {
  let component: LagCorrectionFormComponent;
  let fixture: ComponentFixture<LagCorrectionFormComponent>;
  let orderService: jasmine.SpyObj<OtherIncomeSearchOrderService>;

  const o1: TSearchOrderResult = { orderNumb: 'ORD1', allTotal: 1000, vat: 70, includeVat: true };
  const o2: TSearchOrderResult = { orderNumb: 'ORD2', allTotal: 2000, vat: 140, includeVat: true };

  const selectEvent = (item: TSearchOrderResult): NgbTypeaheadSelectItemEvent<TSearchOrderResult> => ({
    item,
    preventDefault: () => {},
  });

  beforeEach(async () => {
    orderService = jasmine.createSpyObj('OtherIncomeSearchOrderService', ['searchOrder']);
    orderService.searchOrder.and.returnValue(of([o1, o2]));

    await TestBed.configureTestingModule({
      imports: [LagCorrectionFormComponent],
    })
      // LagCorrectionFormComponent declares its own component-level
      // `providers: [OtherIncomeSearchOrderService]`, which shadows a
      // module-level TestBed provider — override the component's own
      // providers instead so the spy is actually injected.
      .overrideComponent(LagCorrectionFormComponent, {
        set: { providers: [{ provide: OtherIncomeSearchOrderService, useValue: orderService }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LagCorrectionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contractId', 1);
    fixture.detectChanges();
  });

  it('blocks submit when there are no line items', () => {
    expect(component.canSubmit()).toBe(false);
  });

  it('adds a line item via onAddLine', () => {
    component.onAddLine(selectEvent(o1));
    expect(component.lagCorrectionForm.lagItems().value().length).toBe(1);
  });

  it('ignores onAddLine when the selected item has no orderNumb', () => {
    component.onAddLine(selectEvent({ ...o1, orderNumb: '' }));
    expect(component.lagCorrectionForm.lagItems().value().length).toBe(0);
  });

  it('removes a line item by orderNumb via onRemoveLine', () => {
    component.onAddLine(selectEvent(o1));
    component.onAddLine(selectEvent(o2));

    component.onRemoveLine('ORD1');

    const remaining = component.lagCorrectionForm.lagItems().value();
    expect(remaining.length).toBe(1);
    expect(remaining[0].order?.orderNumb).toBe('ORD2');
  });

  it('accepts a positive line item amount', () => {
    component.onAddLine(selectEvent(o1));
    component.lagCorrectionForm.lagItems[0].amount().value.set(100);

    expect(component.lagCorrectionForm().valid()).toBe(true);
    expect(component.canSubmit()).toBe(true);
  });

  it('search typeahead does not call the order service for an empty search string', async () => {
    const result = await firstValueFrom(component.search!(of('')), { defaultValue: undefined });
    expect(result).toBeUndefined();
    expect(orderService.searchOrder).not.toHaveBeenCalled();
  });

  it('search typeahead calls searchOrder with contractId and the search term for a non-empty string', async () => {
    await firstValueFrom(component.search!(of('ORD')));
    expect(orderService.searchOrder).toHaveBeenCalledWith(1, 'ORD');
  });

  it('search typeahead excludes already-selected orders from results', async () => {
    component.onAddLine(selectEvent(o1));
    const result = await firstValueFrom(component.search!(of('ORD')));
    expect(result).toEqual([o2]);
  });

  it('emits the built request on submit, padding month, with no note field', () => {
    let emitted: TPostLagCorrectionReq | undefined;
    component.submitCorrection.subscribe((req) => (emitted = req));

    component.onAddLine(selectEvent(o1));
    component.lagCorrectionForm.lagItems[0].amount().value.set(300);
    component.lagCorrectionForm.month().value.set({ year: 2026, month: 9, day: 1 });

    component.onSubmit();

    expect(emitted).toEqual({
      contractId: 1,
      month: '2026-09-01',
      items: [{ orderNumb: 'ORD1', amount: 300 }],
    });
  });

  it('does not emit when submit is attempted while submitting is true', () => {
    let emitted: TPostLagCorrectionReq | undefined;
    component.submitCorrection.subscribe((req) => (emitted = req));

    component.onAddLine(selectEvent(o1));
    component.lagCorrectionForm.lagItems[0].amount().value.set(300);
    fixture.componentRef.setInput('submitting', true);

    component.onSubmit();

    expect(emitted).toBeUndefined();
  });

  it('reset() clears line items back to empty', () => {
    component.onAddLine(selectEvent(o1));
    component.reset();
    expect(component.lagCorrectionForm.lagItems().value().length).toBe(0);
    expect(component.canSubmit()).toBe(false);
  });
});
