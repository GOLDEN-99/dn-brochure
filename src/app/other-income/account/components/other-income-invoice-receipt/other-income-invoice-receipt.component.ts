import { Component, computed, inject, input, output, signal } from '@angular/core';
import { OtherIncomeAccountPeriodService } from '../../services/other-income-account-period.service';
import { TOtherIncomeInvoice, TOtherIncomeMatching, TOtherIncomeReceipt } from '../../../shared/types/other-income.type';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { form, FormField } from "@angular/forms/signals";
import { FormsModule } from '@angular/forms';
import { defaultMatching, matchingSchema } from './matchingForm/matching';


@Component({
  selector: 'other-income-invoice-receipt',
  imports: [DecimalPipe, DatePipe, NgbTypeahead, FormField, FormsModule],
  templateUrl: './other-income-invoice-receipt.component.html',
  styleUrl: './other-income-invoice-receipt.component.scss',
})
export class OtherIncomeInvoiceReceiptComponent {
  success = output<string>()
  fail = output<string>()
  canDelete = input(false)
  private readonly periodService = inject(OtherIncomeAccountPeriodService);
  matches = input.required<TOtherIncomeMatching[]>()

  matchedInvoice = computed(() => {
    let ref = new Map<number, number>()
    for (const record of this.matches()) {
      const saved = ref.get(record.invoiceId) ?? 0;
      ref.set(record.invoiceId, saved + record.matchedAmount)
    }
    return ref
  })

  matchedReceipt = computed(() => {
    let ref = new Map<number, number>()
    for (const record of this.matches()) {
      const saved = ref.get(record.receiptId) ?? 0;
      ref.set(record.receiptId, saved + record.matchedAmount)
    }
    return ref
  })

  receiptList = input.required<TOtherIncomeReceipt[]>();
  formatReceipt = ({ receNumb }: TOtherIncomeReceipt) => receNumb
  searchReceipt = (term$: Observable<string>) => {
    const receiptRef = this.matchedReceipt();
    return term$.pipe(
      distinctUntilChanged(),
      map(t => {
        const normalize = t.toLocaleLowerCase().trim()
        return this.receiptList()
          .map(res => {
            const saved = receiptRef.get(res.id) ?? 0;
            return {
              ...res,
              remainingAmount: res.receAmount - saved
            }
          })
          .filter(({ receNumb, remainingAmount }) => remainingAmount > 0 && receNumb.toLocaleLowerCase().includes(normalize))
      })
    )
  }


  periodId = input.required<number>();

  invoiceList = input.required<TOtherIncomeInvoice[]>();
  formatInvoice = ({ invoiceNumb }: TOtherIncomeInvoice) => invoiceNumb
  selectedInvoice = signal<TOtherIncomeInvoice | null>(null)
  searchInvoice = (term$: Observable<string>) => {
    const invoiceRef = this.matchedInvoice();
    return term$.pipe(
      distinctUntilChanged(),
      //debounceTime(300),
      map(t => {
        const normalize = t.toLocaleLowerCase().trim()
        return this.invoiceList()
          .map(res => {
            const saved = invoiceRef.get(res.id) ?? 0;
            return {
              ...res,
              remainingAmount: res.invoiceAmount - saved
            }
          })
          .filter(({ invoiceNumb, remainingAmount }) => remainingAmount > 0 && invoiceNumb.toLocaleLowerCase().includes(normalize))
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

  onRefetch() { }

  deleting = signal(false)
  cannotDeleteInvoice = computed(() => this.deleting() || !this.canDelete())
  cannotDeleteReceipt = computed(() => this.deleting() || !this.canDelete())

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

