import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { NgbCalendar, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { ngbDateToIso } from '../../../../shared/libs/date-time';
import { TOtherIncomeInvoice, TOtherIncomeMatching, TPostMatchReq, TPostReceiptReq } from '../../../../shared/types/other-income.type';
import { TInvoiceWithRemaining } from './createReceiptForm.type';
import { AppendReceiptForm, appendReceiptSchema } from './append-receipt';

/**
 * Emits receipt + matches as separate payloads (v2 has no combined receipt+match endpoint —
 * `postReceipt` then `postMatch` for each match with the new receipt id must be chained by the caller).
 */
export type AppendReceiptSubmit = {
  receipt: TPostReceiptReq
  matches: Array<Omit<TPostMatchReq, 'receiptId'>>
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

  openInvoiceAmount = computed(() =>
    this.invoicesWithRemaining().reduce((acc, cur) => acc + cur.remainingAmount, 0)
  )

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

  /** Invoices not yet staged into `matches` — once added, an invoice drops out of the typeahead. */
  private readonly availableInvoices = computed(() => {
    const addedIds = new Set(this.appendReceiptState().matches.map(m => m.invoice.id))
    return this.invoicesWithRemaining().filter(inv => !addedIds.has(inv.id))
  })

  private readonly appendReceiptState = linkedSignal<number, AppendReceiptForm>({
    source: this.openInvoiceAmount,
    computation: (openInvoiceAmount, previous) => ({
      ...(previous?.value ?? this.defaultFormValue),
      openInvoiceAmount, receAmount: Math.round(openInvoiceAmount)
    }),
  })

  private readonly defaultFormValue: AppendReceiptForm = {
    openInvoiceAmount: 0,
    receNumb: '',
    receDate: this.today,
    receAmount: 1,
    receRemark: '',
    matches: [],
  }

  appendReceiptForm = form(this.appendReceiptState, appendReceiptSchema)

  submitReceipt = output<AppendReceiptSubmit>()

  canSubmit = computed(() => this.appendReceiptForm().valid() && !this.submitting())

  matchedTotal = computed(() => this.appendReceiptState().matches.reduce((sum, m) => sum + m.matchAmount, 0))

  canAddMatch = computed(() => {
    const { receAmount, matches } = this.appendReceiptState()
    const matchAmount = matches.reduce((a, b) => a + b.matchAmount, 0)
    return matchAmount > 0 && matchAmount <= receAmount
  })

  formatInvoice = ({ invoiceNumb }: TInvoiceWithRemaining) => invoiceNumb
  searchInvoice = (term$: Observable<string>): Observable<TInvoiceWithRemaining[]> => {
    return term$.pipe(
      distinctUntilChanged(),
      map(term => {
        const normalized = term.toLocaleLowerCase().trim()
        return this.availableInvoices().filter(({ invoiceNumb }) => invoiceNumb.toLocaleLowerCase().includes(normalized))
      })
    )
  }

  onSelectInvoice({ item }: NgbTypeaheadSelectItemEvent<TInvoiceWithRemaining>): void {
    this.appendReceiptForm().controlValue.update(({ matches, receAmount, ...res }) => ({ ...res, receAmount, matches: [...matches, { invoice: item, matchAmount: Math.min(item.remainingAmount, receAmount) }] }))
  }

  private readonly remainingReceiptToMatch = computed(() => {
    const { receAmount, matches } = this.appendReceiptState();
    return receAmount - matches.reduce((acc, cur) => acc + cur.matchAmount, 0)
  })

  addMatch(): void {
    // if (!this.canAddMatch()) return
    // this.appendReceiptState.update(state => {
    //   if (!state.matchInvoice) return state
    //   return {
    //     ...state,
    //     matches: [...state.matches, { invoice: state.matchInvoice, matchAmount: state.matchAmount }],
    //     matchInvoice: null,
    //     matchAmount: 0,
    //   }
    // })
  }

  removeMatch(index: number): void {
    this.appendReceiptState.update(state => ({
      ...state,
      matches: state.matches.filter((_, i) => i !== index),
    }))
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { receNumb, receDate, receAmount, receRemark, matches } = this.appendReceiptState()
    this.submitReceipt.emit({
      receipt: { receNumb, receDate: ngbDateToIso(receDate), receAmount, receRemark },
      matches: matches.map(m => ({ invoiceId: m.invoice.id, matchedAmount: m.matchAmount })),
    })
  }

  reset(): void {
    this.appendReceiptState.set(this.defaultFormValue)
  }
}
