import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnCorrectionFormComponent } from './cn-correction-form.component';
import { TOrderContractProduct, TPostCnCorrectionReq } from '../../../../shared/types/other-income.type';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { TSearchProductResult } from '../../../services/other-income-search-product.service';
import { firstValueFrom, of } from 'rxjs';

describe('CnCorrectionFormComponent', () => {
  let component: CnCorrectionFormComponent;
  let fixture: ComponentFixture<CnCorrectionFormComponent>;

  const products: TOrderContractProduct[] = [
    { goodCode: 'G1', goodName: 'Product One', barCode: '1111' },
    { goodCode: 'G2', goodName: 'Product Two', barCode: '2222' },
  ];
  const p1 = products[0] as TSearchProductResult;
  const p2 = products[1] as TSearchProductResult;

  const selectEvent = (item: TSearchProductResult): NgbTypeaheadSelectItemEvent<TSearchProductResult> => ({
    item,
    preventDefault: () => {},
  });

  // Line-item amounts aren't exposed as component inputs/outputs — mutate them
  // the same way the component itself does (via controlValue), matching
  // onAddLine/onRemoveLine's own update pattern.
  const setAmount = (index: number, amount: number) => {
    component.cnCorrectionForm.cnItems().controlValue.update((items) =>
      items.map((it, i) => (i === index ? { ...it, amount } : it)),
    );
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnCorrectionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CnCorrectionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contractId', 1);
    fixture.componentRef.setInput('products', products);
    fixture.detectChanges();
  });

  it('blocks submit when there are no line items, even though the form is otherwise valid', () => {
    expect(component.canSubmit()).toBe(false);
  });

  it('adds a line item via onAddLine and removes it from remainingProduct', () => {
    component.onAddLine(selectEvent(p1));

    expect(component.cnCorrectionForm.cnItems().value().length).toBe(1);
    expect(component.remainingProduct()).toEqual([products[1]]);
  });

  it('ignores onAddLine when the selected item has no goodCode', () => {
    component.onAddLine(selectEvent({ goodCode: '', goodName: 'x', barCode: '' }));
    expect(component.cnCorrectionForm.cnItems().value().length).toBe(0);
  });

  it('removes a line item by goodCode via onRemoveLine', () => {
    component.onAddLine(selectEvent(p1));
    component.onAddLine(selectEvent(p2));

    component.onRemoveLine('G1');

    const remaining = component.cnCorrectionForm.cnItems().value();
    expect(remaining.length).toBe(1);
    expect(remaining[0].product?.goodCode).toBe('G2');
  });

  // min(schema.amount, 0) allows 0 itself (>= 0); a freshly-added line item
  // defaults to amount: 0, so the form is valid but canSubmit still requires
  // at least one line item, which is satisfied here — this documents that
  // amount 0 is NOT rejected by required/min(0), same caveat as manual-correction-form.
  it('treats a line item amount of exactly 0 as valid (min(0) allows 0)', () => {
    component.onAddLine(selectEvent(p1));
    expect(component.cnCorrectionForm().valid()).toBe(true);
    expect(component.canSubmit()).toBe(true);
  });

  it('accepts a positive line item amount', () => {
    component.onAddLine(selectEvent(p1));
    setAmount(0, 100);

    expect(component.cnCorrectionForm().valid()).toBe(true);
    expect(component.canSubmit()).toBe(true);
  });

  it('search typeahead returns [] for an empty search string without filtering products', async () => {
    const result = await firstValueFrom(component.search!(of('')));
    expect(result).toEqual([]);
  });

  it('search typeahead filters remainingProduct by barCode substring', async () => {
    const result = await firstValueFrom(component.search!(of('222')));
    expect(result).toEqual([products[1]]);
  });

  it('search typeahead excludes already-selected products', async () => {
    component.onAddLine(selectEvent(p2));
    const result = await firstValueFrom(component.search!(of('222')));
    expect(result).toEqual([]);
  });

  it('searchProdcutName filters case-insensitively by goodName substring', async () => {
    const result = await firstValueFrom(component.searchProdcutName!(of('product two')));
    expect(result).toEqual([products[1]]);
  });

  it('emits the built request on submit, padding month and dropping empty note', () => {
    let emitted: TPostCnCorrectionReq | undefined;
    component.submitCorrection.subscribe((req) => (emitted = req));

    component.onAddLine(selectEvent(p1));
    setAmount(0, 250);
    component.cnCorrectionForm.month().controlValue.set({ year: 2026, month: 6, day: 1 });

    component.onSubmit();

    expect(emitted).toEqual({
      contractId: 1,
      month: '2026-06-01',
      items: [{ goodCode: 'G1', amount: 250 }],
      note: undefined,
    });
  });

  it('does not emit when submit is attempted while invalid', () => {
    let emitted: TPostCnCorrectionReq | undefined;
    component.submitCorrection.subscribe((req) => (emitted = req));

    component.onSubmit();

    expect(emitted).toBeUndefined();
  });

  it('reset() clears line items back to empty', () => {
    component.onAddLine(selectEvent(p1));
    component.reset();
    expect(component.cnCorrectionForm.cnItems().value().length).toBe(0);
    expect(component.canSubmit()).toBe(false);
  });
});
