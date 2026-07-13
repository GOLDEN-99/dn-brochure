import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { TPostManualCorrectionReq } from '../../../../shared/types/other-income.type';
import { ManualCorrectionForm, manualCorrectionSchema } from './manual-correction-form';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { SignalMonthPickerComponent } from '../../../../../components/crm-promotion/signal-month-picker.component';

@Component({
  selector: 'other-income-manual-correction-form',
  imports: [FormField, SignalMonthPickerComponent],
  templateUrl: './manual-correction-form.component.html',
  styles: '',
})
export class ManualCorrectionFormComponent {
  contractId = input.required<number>()
  contractType = input.required<'ORDER' | 'BRANCH' | 'PROMO'>()
  submitting = input(false)

  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()

  private buildInitialState(): ManualCorrectionForm {
    return {
      month: { ...this.today, day: 1 },
      contractType: this.contractType(),
      amount: 0,
      orderAmount: 0,
      sign: 1,
      note: '',
    }
  }

  // recomputes (resetting the form) whenever contractType changes; safe to
  // read contractType() here since linkedSignal's computation runs reactively,
  // not at field-initializer time.
  private readonly manualCorrectionState = linkedSignal(() => this.buildInitialState())

  manualCorrectionForm = form(this.manualCorrectionState, manualCorrectionSchema)

  submitCorrection = output<TPostManualCorrectionReq>()

  canSubmit = computed(() => this.manualCorrectionForm().valid() && !this.submitting())

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { month: { month, year }, amount, orderAmount, sign, note } = this.manualCorrectionState()
    const contractId = this.contractId()
    const contractType = this.contractType()
    const monthStr = `${year}-${month.toString().padStart(2, '0')}-01`
    const note_ = note || undefined

    this.submitCorrection.emit(
      contractType === 'ORDER'
        ? { contractId, contractType, month: monthStr, orderAmount: orderAmount * sign, note: note_ }
        : { contractId, contractType, month: monthStr, amount: amount * sign, note: note_ }
    )
  }

  reset(): void {
    this.manualCorrectionState.set(this.buildInitialState())
  }
}
