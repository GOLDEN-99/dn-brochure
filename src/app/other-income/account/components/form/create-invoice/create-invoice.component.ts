import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { SignalDatepickerComponent } from "../../../../../components/crm-promotion/signal-datepicker.component";
import { form, FormField } from "@angular/forms/signals";
import { TCreateInvoiceForm } from './createInvoice.type';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeAccountPeriodService } from '../../../services/other-income-account-period.service';
import { createInvoiceSchema, defaultInvoice } from './createInvoice';
import { ngbDateToIso } from '../../../../shared/libs/date-time';
import { FormsModule } from '@angular/forms';
import { NumericInputDirective } from "../../../../../shared/directives/numeric-input.directive";

@Component({
  selector: 'other-income-create-invoice',
  imports: [SignalDatepickerComponent, FormField, FormsModule, NumericInputDirective],
  templateUrl: './create-invoice.component.html',
  styles: '',
})
export class CreateInvoiceComponent {
  closeModal = output<void>()
  success = output<any>()
  fail = output<any>()
  submitting = signal(false)
  private readonly calendar = inject(NgbCalendar)
  private readonly accountPeriodService = inject(OtherIncomeAccountPeriodService)
  periodId = input.required<number>()
  totalIncome = input(0)
  remainingIncome = input(0)

  private readonly formData = linkedSignal<TCreateInvoiceForm>(() => {
    const remaining = this.remainingIncome()
    const invoiceDate = this.calendar.getToday()
    return { ...defaultInvoice, invoiceDate, remainingIncome: remaining, invoiceAmount: String(remaining) }
  })

  createForm = form(this.formData, createInvoiceSchema)

  onSubmit() {
    this.submitting.set(true)
    const formState = this.createForm()
    if (formState.invalid()) {
      this.submitting.set(false)
      this.fail.emit(formState.errorSummary());
      return
    }
    const { invoiceNumb, invoiceAmount, invoiceRemark, invoiceDate } = formState.value();
    this.accountPeriodService.insertInv(this.periodId(), {
      invoiceNumb,
      invoiceDate: ngbDateToIso(invoiceDate),
      invoiceRemark,
      invoiceAmount: Number.parseFloat(invoiceAmount),
    }).subscribe({
      next: () => {
        this.submitting.set(false)
        this.success.emit('ok');
        this.closeModal.emit();
      },
      error: (err) => {
        this.submitting.set(false)
        this.fail.emit(err)
      }
    })
  }

  cannotSubmit = computed(() => this.createForm().invalid() || this.submitting())
}
