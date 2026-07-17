import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TPostLagCorrectionReq } from '../../../../shared/types/other-income.type';
import { LagCorrectionForm, lagCorrectionSchema } from './lag-correction-form';
import { NgbCalendar, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { map, Observable, switchMap } from 'rxjs';
import { OtherIncomeSearchOrderService, TSearchOrderResult } from '../../../services/other-income-search-order.service';
import { SignalMonthPickerComponent } from '../../../../../components/crm-promotion/signal-month-picker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';

@Component({
  selector: 'other-income-lag-correction-form',
  imports: [NgbTypeahead, FormField, SignalMonthPickerComponent, FormAlertTextComponent],
  templateUrl: './lag-correction-form.component.html',
  styles: '',
  providers: [OtherIncomeSearchOrderService],
})
export class LagCorrectionFormComponent {
  private readonly orderService = inject(OtherIncomeSearchOrderService)

  contractId = input.required<number>()
  submitting = input(false)

  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()

  private readonly lagCorrectionState = signal<LagCorrectionForm>({
    month: { ...this.today, day: 1 },
    lagItems: [],
  })

  lagCorrectionForm = form(this.lagCorrectionState, lagCorrectionSchema)

  submitCorrection = output<TPostLagCorrectionReq>()

  selectedOrder = computed(() => {
    return new Set(this.lagCorrectionState().lagItems.flatMap(({ order }) => order?.orderNumb ? [order.orderNumb] : []))
  })

  search: NgbTypeahead['ngbTypeahead'] = (search$: Observable<string>) => {
    return search$.pipe(
      switchMap(search => search === '' ? [] : this.orderService.searchOrder(this.contractId(), search)),
      map(results => results.filter(o => !this.selectedOrder().has(o.orderNumb)))
    )
  }

  formatOrder = ({ orderNumb, allTotal }: TSearchOrderResult) => `${orderNumb} (${allTotal})`

  canSubmit = computed(() => this.lagCorrectionForm().valid() && this.lagCorrectionState().lagItems.length > 0 && !this.submitting())

  onAddLine({ item }: NgbTypeaheadSelectItemEvent<TSearchOrderResult>) {
    if (!item.orderNumb) return
    this.lagCorrectionForm.lagItems().controlValue.update(prev => [...prev, { order: item, amount: 0 }])
  }

  onRemoveLine(orderNumb: string | undefined): void {
    this.lagCorrectionForm.lagItems().controlValue.update(list => list.filter(({ order }) => order?.orderNumb !== orderNumb))
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { month: { month, year }, lagItems } = this.lagCorrectionState()
    this.submitCorrection.emit({
      contractId: this.contractId(),
      month: `${year}-${month.toString().padStart(2, '0')}-01`,
      items: lagItems.flatMap(({ order, amount }) => order?.orderNumb ? [{ orderNumb: order.orderNumb, amount }] : []),
    })
  }

  reset(): void {
    this.lagCorrectionState.set({
      month: { ...this.today, day: 1 },
      lagItems: [],
    })
  }
}
