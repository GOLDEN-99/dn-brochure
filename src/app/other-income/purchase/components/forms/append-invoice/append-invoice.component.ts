import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { TPostInvoiceReq } from '../../../../shared/types/other-income.type';
import { AppendInvoiceForm, appendInvoiceSchema } from './append-invoice';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { ngbDateToIso } from '../../../../shared/libs/date-time';
import { floorSatang, roundSatang } from '../../../../shared/libs/money';

@Component({
  selector: 'other-income-append-invoice',
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent],
  templateUrl: './append-invoice.component.html',
  styles: '',
})
export class AppendInvoiceComponent {
  submitting = input(false)
  openSettlement = input.required<number>()

  private readonly calendar = inject(NgbCalendar)
  private readonly today = this.calendar.getToday()

  private readonly defaultInvoiceState: AppendInvoiceForm = {
    openSettleAmount: 0,
    invoiceNumb: '',
    invoiceDate: this.today,
    invoiceAmount: 1,
    invoiceRemark: '',
  }

  /**
   * Both the ceiling and the prefill are floored to satang: the prefill is what the user
   * sees and submits unchanged in the common "bill the whole remainder" case, so it must
   * never land above the `max` it is validated against. `Math.round` here used to open the
   * form already invalid for any remainder with a fractional part above .5.
   */
  private readonly appendInvoiceState = linkedSignal<number, AppendInvoiceForm>({
    source: this.openSettlement,
    computation: (rawOpenSettleAmount, previous) => {
      const openSettleAmount = floorSatang(rawOpenSettleAmount)
      return {
        ...(previous?.value ?? this.defaultInvoiceState),
        openSettleAmount, invoiceAmount: openSettleAmount,
      }
    },
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
      invoiceAmount: roundSatang(invoiceAmount),
      invoiceRemark,
    })
  }

  reset(): void {
    this.appendInvoiceState.set(this.defaultInvoiceState)
  }
}
