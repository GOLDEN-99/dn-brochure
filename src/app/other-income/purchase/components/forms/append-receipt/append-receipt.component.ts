import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NgbCalendar, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { ngbDateToIso } from '../../../../shared/libs/date-time';
import { TOtherIncomeInvoice, TOtherIncomeMatching, TPostMatchReq, TPostReceiptReq } from '../../../../shared/types/other-income.type';
import { TInvoiceWithRemaining } from '../../../../account/components/form/create-receipt/createReceiptForm.type';
import { AppendReceiptForm, appendReceiptSchema } from './append-receipt';

/**
 * Emits receipt + match as separate payloads (v2 has no combined receipt+match endpoint —
 * `postReceipt` then `postMatch` with the new receipt id must be chained by the caller).
 */
export type AppendReceiptSubmit = {
  receipt: TPostReceiptReq
  match: Omit<TPostMatchReq, 'receiptId'>
}

@Component({
  selector: 'other-income-append-receipt',
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent, NgbTypeahead, FormsModule],
  templateUrl: './append-receipt.component.html',
  styles: '',
})
export class AppendReceiptComponent {
  submitting = input(false)
  invoices = input.required<TOtherIncomeInvoice[]>()
  matches = input.required<TOtherIncomeMatching[]>()

  private readonly calendar = inject(NgbCalendar)
  private readonly today = this.calendar.getToday()

  private readonly matchedByInvoiceId = computed(() => {
    const map = new Map<number, number>()
    for (const m of this.matches()) map.set(m.invoiceId, (map.get(m.invoiceId) ?? 0) + m.matchedAmount)
    return map
  })

  invoicesWithRemaining = computed<TInvoiceWithRemaining[]>(() => {
    const matched = this.matchedByInvoiceId()
    return this.invoices().map(inv => ({ ...inv, remainingAmount: inv.invoiceAmount - (matched.get(inv.id) ?? 0) }))
  })

  private readonly appendReceiptState = signal<AppendReceiptForm>({
    receNumb: '',
    receDate: this.today,
    receAmount: 0,
    receRemark: '',
    matchInvoice: null,
    matchAmount: 0,
  })

  appendReceiptForm = form(this.appendReceiptState, appendReceiptSchema)

  submitReceipt = output<AppendReceiptSubmit>()

  canSubmit = computed(() => this.appendReceiptForm().valid() && !this.submitting())

  formatInvoice = ({ invoiceNumb }: TInvoiceWithRemaining) => invoiceNumb
  searchInvoice = (term$: Observable<string>): Observable<TInvoiceWithRemaining[]> => {
    return term$.pipe(
      distinctUntilChanged(),
      map(term => {
        const normalized = term.toLocaleLowerCase().trim()
        return this.invoicesWithRemaining().filter(({ invoiceNumb }) => invoiceNumb.toLocaleLowerCase().includes(normalized))
      })
    )
  }

  onSelectInvoice({ item }: NgbTypeaheadSelectItemEvent<TInvoiceWithRemaining>): void {
    this.appendReceiptState.update(state => ({ ...state, matchInvoice: item }))
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { receNumb, receDate, receAmount, receRemark, matchInvoice, matchAmount } = this.appendReceiptState()
    if (!matchInvoice) return
    this.submitReceipt.emit({
      receipt: { receNumb, receDate: ngbDateToIso(receDate), receAmount, receRemark },
      match: { invoiceId: matchInvoice.id, matchedAmount: matchAmount },
    })
  }

  reset(): void {
    this.appendReceiptState.set({
      receNumb: '',
      receDate: this.today,
      receAmount: 0,
      receRemark: '',
      matchInvoice: null,
      matchAmount: 0,
    })
  }
}
