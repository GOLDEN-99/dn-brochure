import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TOrderContractProduct, TPostCnCorrectionReq } from '../../../../shared/types/other-income.type';
import { CnCorrectionForm, cnCorrectionSchema } from './cn-correction-form';
import { NgbCalendar, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { map, Observable } from 'rxjs';
import { TSearchProductResult } from '../../../services/other-income-search-product.service';
import { SignalMonthPickerComponent } from '../../../../../components/crm-promotion/signal-month-picker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';

@Component({
  selector: 'other-income-cn-correction-form',
  imports: [NgbTypeahead, FormField, SignalMonthPickerComponent, FormAlertTextComponent],
  templateUrl: './cn-correction-form.component.html',
  styles: '',
})
export class CnCorrectionFormComponent {
  contractId = input.required<number>()
  products = input.required<TOrderContractProduct[]>()
  submitting = input(false)

  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()

  private readonly cnCorrectionState = signal<CnCorrectionForm>({
    month: { ...this.today, day: 1 },
    cnItems: [],
    note: '',
  })

  cnCorrectionForm = form(this.cnCorrectionState, cnCorrectionSchema)

  submitCorrection = output<TPostCnCorrectionReq>()

  selectedProduct = computed(() => {
    return new Set(this.cnCorrectionState().cnItems.flatMap(({ product }) => product?.goodCode ? [product.goodCode] : []))
  })

  remainingProduct = computed(() => {
    const ref = this.selectedProduct()
    return this.products().filter(p => !ref.has(p.goodCode))
  })

  search: NgbTypeahead['ngbTypeahead'] = (search$: Observable<string>) => {
    return search$.pipe(
      map(search => search === '' ? [] : this.remainingProduct().filter(p => p.barCode?.includes(search)))
    )
  }

  searchProdcutName: NgbTypeahead['ngbTypeahead'] = (search$: Observable<string>) => {
    return search$.pipe(
      map(search => search === '' ? [] : this.remainingProduct().filter(p => p.goodName?.toLowerCase().includes(search.toLowerCase())))
    )
  }

  formatProduct = ({ barCode, goodName }: TSearchProductResult) => `(${barCode}) ${goodName}`

  canSubmit = computed(() => this.cnCorrectionForm().valid() && this.cnCorrectionState().cnItems.length > 0 && !this.submitting())

  onAddLine({ item }: NgbTypeaheadSelectItemEvent<TSearchProductResult>) {
    if (!item.goodCode) return
    this.cnCorrectionForm.cnItems().controlValue.update(prev => [...prev, { product: item, amount: 0 }])
  }

  onRemoveLine(goodCode: string | undefined): void {
    this.cnCorrectionForm.cnItems().controlValue.update(list => list.filter(({ product }) => product?.goodCode !== goodCode))
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { month: { month, year }, note, cnItems } = this.cnCorrectionState()
    this.submitCorrection.emit({
      contractId: this.contractId(),
      month: `${year}-${month.toString().padStart(2, '0')}-01`,
      items: cnItems.flatMap(({ product, amount }) => product?.goodCode ? [{ goodCode: product.goodCode, amount }] : []),
      note: note || undefined,
    })
  }

  reset(): void {
    this.cnCorrectionState.set({
      month: { ...this.today, day: 1 },
      cnItems: [],
      note: '',
    })
  }
}
