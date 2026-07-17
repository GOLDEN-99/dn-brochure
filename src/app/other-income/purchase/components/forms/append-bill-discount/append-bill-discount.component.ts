import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TBillDiscountOrderLine, TBillDiscountSearchParams, TDiscType, TPostBillDiscountReq } from '../../../../shared/types/other-income.type';
import { Observable } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateInputComponent } from '../../../../../components/date-input/date-input.component';
import { ngbDateToIso } from '../../../../shared/libs/date-time';

const DISC_TYPE_OPTIONS: { value: TDiscType; label: string }[] = [
  { value: 'Dc', label: 'ส่วนลด (Dc)' },
  { value: 'Rebate', label: 'Rebate' },
  { value: 'Ince', label: 'Incentive' },
  { value: 'Compensate', label: 'Compensate' },
  { value: 'Cash', label: 'Cash' },
  { value: 'All', label: 'ทั้งหมด' },
]

export type TBillDiscountSearchFilters = Omit<TBillDiscountSearchParams, 'compType' | 'compCode'>

/**
 * Search is explicit (button-triggered), not typed-as-you-go: discType is required by the
 * endpoint and results are flat per-(orderNumb, receNumb) lines, so a single order can
 * contribute multiple pickable rows — selection is keyed by that pair, not by orderNumb alone.
 */
@Component({
  selector: 'other-income-append-bill-discount',
  imports: [DecimalPipe, DatePipe, FormsModule, DateInputComponent],
  templateUrl: './append-bill-discount.component.html',
  styles: '',
})
export class AppendBillDiscountComponent {
  private readonly calendar = inject(NgbCalendar)

  submitting = input(false)
  search = input.required<(filters: TBillDiscountSearchFilters) => Observable<TBillDiscountOrderLine[]>>()

  submitBillDiscounts = output<TPostBillDiscountReq[]>()

  discTypeOptions = DISC_TYPE_OPTIONS

  discType = signal<TDiscType>('Dc')
  order = signal('')
  orderStart = signal<NgbDateStruct>(this.calendar.getToday())
  orderEnd = signal<NgbDateStruct>(this.calendar.getToday())

  searching = signal(false)
  results = signal<TBillDiscountOrderLine[]>([])
  pending = signal<TBillDiscountOrderLine[]>([])

  canSubmit = computed(() => this.pending().length > 0 && !this.submitting())

  private key(row: TBillDiscountOrderLine): string {
    return `${row.orderNumb}::${row.receNumb}`
  }

  isPicked(row: TBillDiscountOrderLine): boolean {
    const key = this.key(row)
    return this.pending().some(p => this.key(p) === key)
  }

  onSearch(): void {
    this.searching.set(true)
    const filters: TBillDiscountSearchFilters = {
      discType: this.discType(),
      order: this.order().trim() || null,
      orderDateRange: { start: ngbDateToIso(this.orderStart()), end: ngbDateToIso(this.orderEnd()) },
    }
    this.search()(filters).subscribe({
      next: (rows) => {
        this.results.set(rows)
        this.searching.set(false)
      },
      error: () => {
        this.results.set([])
        this.searching.set(false)
      },
    })
  }

  toggleRow(row: TBillDiscountOrderLine, checked: boolean): void {
    const key = this.key(row)
    if (checked) {
      if (!this.isPicked(row)) this.pending.update(prev => [...prev, row])
    } else {
      this.pending.update(prev => prev.filter(p => this.key(p) !== key))
    }
  }

  removePending(row: TBillDiscountOrderLine): void {
    const key = this.key(row)
    this.pending.update(prev => prev.filter(p => this.key(p) !== key))
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const reqs = this.pending().map(({ orderNumb, receNumb, incentiveAmount, remark }) => ({
      orderNumb, receNumb, subtotalAmount: incentiveAmount, remark,
    }))
    this.submitBillDiscounts.emit(reqs)
  }

  reset(): void {
    this.results.set([])
    this.pending.set([])
  }
}
