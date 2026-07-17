import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { TCreateReceiptForm, createReceiptSchema, defaultCreateReceipt } from './other-income-create-receipt';
import { SignalDatepickerComponent } from '../../../crm-promotion/signal-datepicker.component';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PeriodService } from '../../../../service/other-income/period.service';

@Component({
  selector: 'app-other-income-create-receipt',
  imports: [SignalDatepickerComponent, FormField, FormsModule],
  templateUrl: './other-income-create-receipt.component.html',
  styles: '',
})
export class OtherIncomeCreateReceiptComponent {
  closeModal = output<void>()
  success = output<any>()
  fail = output<any>()
  submitting = signal(false)
  private readonly calendar = inject(NgbCalendar)
  private readonly periodService = inject(PeriodService)
  periodId = input.required<number>()
  totalInvoice = input(0)
  remainingInvoice = input(0)

  private readonly formData = linkedSignal<TCreateReceiptForm>(() => {
    const remaining = this.remainingInvoice()
    const receDate = this.calendar.getToday()
    return { ...defaultCreateReceipt, receDate, remainingInvoice: remaining, receAmount: String(remaining) }
  })

  createForm = form(this.formData, createReceiptSchema)

  onSubmit() {
    this.submitting.set(true)
    const formState = this.createForm()
    if (formState.invalid()) {
      this.submitting.set(false)
      this.fail.emit(formState.errorSummary());
      return
    }
    const { receNumb, receAmount, receRemark, receDate } = formState.value();
    const { year, month, day } = receDate
    this.periodService.insertRece(this.periodId(), {
      receNumb,
      receDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      receRemark,
      receAmount: Number.parseFloat(receAmount),
    }).subscribe({
      next: () => {
        this.submitting.set(false)
        this.success.emit('ok')
        this.closeModal.emit()
      },
      error: (err) => {
        this.submitting.set(false)
        this.fail.emit(err)
      }
    })
  }

  cannotSubmit = computed(() => this.createForm().invalid() || this.submitting())
}
