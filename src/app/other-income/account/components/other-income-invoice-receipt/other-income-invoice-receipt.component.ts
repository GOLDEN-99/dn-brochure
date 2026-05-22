import { Component, inject, input, output, signal } from '@angular/core';
import { OtherIncomeAccountPeriodService } from '../../services/other-income-account-period.service';
import { TOtherIncomeInvoice, TOtherIncomeReceipt } from '../../../shared/types/other-income.type';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NgbCalendar, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { form, FormField } from "@angular/forms/signals";
import { FormsModule } from '@angular/forms';
import { defaultMatching, matchingSchema } from './matchingForm/matching';
import { createInvoiceSchema, defaultInvoice } from '../form/create-invoice/createInvoice';
import { TCreateInvoiceForm } from '../form/create-invoice/createInvoice.type';


@Component({
  selector: 'other-income-invoice-receipt',
  imports: [DecimalPipe, DatePipe, NgbTypeahead, FormField, FormsModule],
  templateUrl: './other-income-invoice-receipt.component.html',
  styleUrl: './other-income-invoice-receipt.component.scss',
})
export class OtherIncomeInvoiceReceiptComponent {
  success = output<string>()
  fail = output<string>()
  private readonly calendarService = inject(NgbCalendar)

  private readonly initialCreateInvoice: TCreateInvoiceForm = {
    ...defaultInvoice, invDate: this.calendarService.getToday()
  }
  createInvData = signal(this.initialCreateInvoice)
  createInvoiceForm = form(this.createInvData, createInvoiceSchema)

  private readonly periodService = inject(OtherIncomeAccountPeriodService);

  receiptList = input.required<TOtherIncomeReceipt[]>();
  formatReceipt = ({ receNumb }: TOtherIncomeReceipt) => receNumb
  searchReceipt = (term$: Observable<string>) => {
    return term$.pipe(
      distinctUntilChanged(),
      map(t => {
        const normalize = t.toLocaleLowerCase().trim()
        return this.receiptList().filter(({ receNumb, remainingAmount }) => remainingAmount > 0 && receNumb.toLocaleLowerCase().includes(normalize))
      })
    )
  }


  periodId = input.required<number>();

  invoiceList = input.required<TOtherIncomeInvoice[]>();
  formatInvoice = ({ invNumb }: TOtherIncomeInvoice) => invNumb
  selectedInvoice = signal<TOtherIncomeInvoice | null>(null)
  searchInvoice = (term$: Observable<string>) => {
    return term$.pipe(
      distinctUntilChanged(),
      //debounceTime(300),
      map(t => {
        const normalize = t.toLocaleLowerCase().trim()
        return this.invoiceList().filter(({ invNumb, remainingAmount }) => remainingAmount > 0 && invNumb.toLocaleLowerCase().includes(normalize))
      })
    )
  }
  matchingState = signal(defaultMatching)
  matchForm = form(this.matchingState, matchingSchema)

  onMatch() {
    const form = this.matchForm();
    if (form.invalid()) {
      return
    }
    const { invoice, receipt, matchAmount } = form.value();
    if (typeof invoice === 'string' || typeof receipt === 'string') {
      return
    }
    this.periodService.matchInvoiceToReceipt(this.periodId(), {
      invoiceId: invoice.id,
      receiptId: receipt.id,
      matchedAmount: Number.parseFloat(matchAmount)
    }).subscribe({
      next: () => {
        form.reset(defaultMatching);
        this.onRefetch();
      },
      error: () => { }
    })
  }


  deleting = signal(false)
  onRefetch() { }

  onDeleteInvoice(invId: number) {
    this.deleting.set(true)
    this.periodService.deleteInvoice(this.periodId(), invId).subscribe({
      next: () => {
        this.success.emit('ลำสำเร็จ');
        this.deleting.set(false);
      },
      error: (err) => { this.fail.emit(err.message) }
    })
  }
  onDeleteReceipt(receId: number) {
    this.deleting.set(true)
    this.periodService.deleteReceipt(this.periodId(), receId).subscribe({
      next: () => {
        this.success.emit('ลำสำเร็จ');
        this.deleting.set(false);
      },
      error: (err) => { this.fail.emit(err.message) }
    })
  }
}

