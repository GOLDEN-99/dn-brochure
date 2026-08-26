import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { NgbCalendar, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { ngbDateToIso } from '../../../../shared/libs/date-time';
import { floorSatang, roundSatang } from '../../../../shared/libs/money';
import { TOtherIncomeInvoice, TOtherIncomeMatching, TPostMatchReq, TPostReceiptReq } from '../../../../shared/types/other-income.type';
import { TInvoiceWithRemaining, TPendingMatch } from './createReceiptForm.type';
import { AppendReceiptForm, appendReceiptSchema, pendingMatchSchema } from './append-receipt';

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
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent, NgbTypeahead, FormsModule, DecimalPipe],
  templateUrl: './append-receipt.component.html',
  styles: '',
})
export class AppendReceiptComponent {
  submitting = input(false)
  invoices = input.required<TOtherIncomeInvoice[]>()
  matches = input.required<TOtherIncomeMatching[]>()

  openInvoiceAmount = computed(() =>
    floorSatang(this.invoicesWithRemaining().reduce((acc, cur) => acc + cur.remainingAmount, 0))
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
    // Floored: this is the ceiling the match-amount validator and its message both use.
    return this.invoices().map(inv => ({ ...inv, remainingAmount: floorSatang(inv.invoiceAmount - (matched.get(inv.id) ?? 0)) }))
  })

  /** Invoices not yet staged into `matches` — once added, an invoice drops out of the typeahead. */
  private readonly availableInvoices = computed(() => {
    const addedIds = new Set(this.appendReceiptState().matches.map(m => m.invoice.id))
    return this.invoicesWithRemaining().filter(inv => !addedIds.has(inv.id))
  })

  /**
   * `openInvoiceAmount` is already floored to satang, and the prefill mirrors it exactly:
   * the default "receipt covers every open invoice" case must satisfy its own `max`.
   * `Math.round` here used to open the form already invalid.
   */
  appendReceiptState = linkedSignal<number, AppendReceiptForm>({
    source: this.openInvoiceAmount,
    computation: (openInvoiceAmount, previous) => ({
      ...(previous?.value ?? this.defaultFormValue),
      openInvoiceAmount, receAmount: openInvoiceAmount
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

  matchedTotal = computed(() => roundSatang(this.appendReceiptState().matches.reduce((sum, m) => sum + m.matchAmount, 0)))

  remainingRceipt = computed(() => floorSatang(this.appendReceiptState().receAmount - this.matchedTotal()))

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

  /** Staged separately from `matches` so the user can edit the amount before committing the row. */
  private readonly defaultPendingMatch: TPendingMatch = { invoice: null, matchAmount: 0 }
  pendingMatchState = signal<TPendingMatch>(this.defaultPendingMatch)
  pendingMatchForm = form(this.pendingMatchState, pendingMatchSchema)

  canConfirmMatch = computed(() => this.pendingMatchForm().valid() && this.pendingMatchState().matchAmount <= this.remainingRceipt())

  onSelectInvoice({ item }: NgbTypeaheadSelectItemEvent<TInvoiceWithRemaining>): void {
    this.pendingMatchState.set({ invoice: item, matchAmount: floorSatang(Math.min(item.remainingAmount, this.remainingRceipt())) })
  }

  addMatch(): void {
    if (!this.canConfirmMatch()) return
    const { invoice, matchAmount } = this.pendingMatchState()
    if (!invoice) return
    this.appendReceiptForm().controlValue.update(({ matches, receAmount, ...res }) => ({
      ...res, receAmount, matches: [...matches, { invoice, matchAmount }],
    }))
    this.pendingMatchState.set(this.defaultPendingMatch)
  }

  cancelPendingMatch(): void {
    this.pendingMatchState.set(this.defaultPendingMatch)
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
      receipt: { receNumb, receDate: ngbDateToIso(receDate), receAmount: roundSatang(receAmount), receRemark },
      matches: matches.map(m => ({ invoiceId: m.invoice.id, matchedAmount: roundSatang(m.matchAmount) })),
    })
  }

  reset(): void {
    this.appendReceiptState.set(this.defaultFormValue)
  }
}
