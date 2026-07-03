import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TPostInvoiceReq } from '../../../../shared/types/other-income.type';
import { AppendInvoiceForm, appendInvoiceSchema } from './append-invoice';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { ngbDateToIso } from '../../../../shared/libs/date-time';

@Component({
  selector: 'other-income-append-invoice',
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent],
  templateUrl: './append-invoice.component.html',
  styles: '',
})
export class AppendInvoiceComponent {
  submitting = input(false)

  private readonly calendar = inject(NgbCalendar)
  private readonly today = this.calendar.getToday()

  private readonly appendInvoiceState = signal<AppendInvoiceForm>({
    invoiceNumb: '',
    invoiceDate: this.today,
    invoiceAmount: 0,
    invoiceRemark: '',
  })

  appendInvoiceForm = form(this.appendInvoiceState, appendInvoiceSchema)

  submitInvoice = output<TPostInvoiceReq>()

  canSubmit = computed(() => this.appendInvoiceForm().valid() && !this.submitting())

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { invoiceNumb, invoiceDate, invoiceAmount, invoiceRemark } = this.appendInvoiceState()
    this.submitInvoice.emit({
      invoiceNumb,
      invoiceDate: ngbDateToIso(invoiceDate),
      invoiceAmount,
      invoiceRemark,
    })
  }

  reset(): void {
    this.appendInvoiceState.set({
      invoiceNumb: '',
      invoiceDate: this.today,
      invoiceAmount: 0,
      invoiceRemark: '',
    })
  }
}
