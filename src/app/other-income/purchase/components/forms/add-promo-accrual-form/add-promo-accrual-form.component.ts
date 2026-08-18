import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TPostPromoAccrualReq } from '../../../../shared/types/other-income.type';
import { AddPromoAccrualForm, addPromoAccrualSchema } from './add-promo-accrual-form';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { SignalMonthPickerComponent } from '../../../../../components/crm-promotion/signal-month-picker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';

@Component({
  selector: 'other-income-add-promo-accrual-form',
  imports: [FormField, SignalMonthPickerComponent, FormAlertTextComponent],
  templateUrl: './add-promo-accrual-form.component.html',
  styles: '',
})
export class AddPromoAccrualFormComponent {
  contractId = input.required<number>()
  submitting = input(false)

  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()

  private readonly addPromoAccrualState = signal<AddPromoAccrualForm>({
    month: { ...this.today, day: 1 },
    amount: 0,
  })

  addPromoAccrualForm = form(this.addPromoAccrualState, addPromoAccrualSchema)

  submitAddPromoAccrual = output<TPostPromoAccrualReq>()

  canSubmit = computed(() => this.addPromoAccrualForm().valid() && !this.submitting())

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { month: { month, year }, amount } = this.addPromoAccrualState()
    this.submitAddPromoAccrual.emit({
      month: `${year}-${month.toString().padStart(2, '0')}-01`,
      amount,
    })
  }

  reset(): void {
    this.addPromoAccrualState.set({
      month: { ...this.today, day: 1 },
      amount: 0,
    })
  }
}
