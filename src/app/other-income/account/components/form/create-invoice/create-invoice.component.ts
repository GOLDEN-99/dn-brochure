import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { SignalDatepickerComponent } from "../../../../../components/crm-promotion/signal-datepicker.component";
import { form, FormField } from "@angular/forms/signals";
import { TCreateInvoiceForm } from './createInvoice.type';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeAccountPeriodService } from '../../../services/other-income-account-period.service';
import { createInvoiceSchema, defaultInvoice } from './createInvoice';
import { ngbDateToIso } from '../../../../shared/libs/date-time';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'other-income-create-invoice',
  imports: [SignalDatepickerComponent, FormField, FormsModule],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.scss',
})
export class CreateInvoiceComponent {
  closeModal = output<void>()
  success = output<any>()
  fail = output<any>()
  private readonly calendar = inject(NgbCalendar)
  private readonly accountPeriodService = inject(OtherIncomeAccountPeriodService)
  periodId = input.required<number>()
  totalIncome = input(0)
  remainingIncome = input(0)
  //schemaFn = computed(() => createReceiptSchemaWithMaximum(this.remainingInvoice()))


  private readonly formData = linkedSignal<TCreateInvoiceForm>(() => {
    const remaining = this.remainingIncome()
    const invDate = this.calendar.getToday()
    return { ...defaultInvoice, invDate, invAmount: String(remaining) }
  })

  createForm = form(this.formData, createInvoiceSchema)

  onSubmit() {
    const formState = this.createForm()
    if (formState.invalid()) {
      this.fail.emit(formState.errorSummary());
      return
    }
    const { invNumb, invAmount, invRemark, invDate } = formState.value();
    this.accountPeriodService.insertInv(this.periodId(), {
      invNumb,
      invDate: ngbDateToIso(invDate),
      invRemark,
      invAmount: Number.parseFloat(invAmount),
    }).subscribe({
      next: () => {
        this.success.emit('ok')
      },
      error: (err) => this.fail.emit(err),
      complete: () => { }
    })
  }
}
