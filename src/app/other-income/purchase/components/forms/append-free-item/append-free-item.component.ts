import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TFreeItemOrderLine, TFreeItemSearchParams, TItemRema, TPostFreeItemReq } from '../../../../shared/types/other-income.type';
import { Observable } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateInputComponent } from '../../../../../components/date-input/date-input.component';
import { ngbDateToIso } from '../../../../shared/libs/date-time';

const ITEM_REMA_OPTIONS: { value: TItemRema; label: string }[] = [
  { value: 'Dc', label: 'ส่วนลด (Dc)' },
  { value: 'Rebate', label: 'Rebate' },
  { value: 'Ince', label: 'Incentive' },
  { value: 'Compensation', label: 'Compensate' },
  { value: 'Promotion', label: 'Promotion' },
  { value: 'Charge', label: 'ค่าแรกเข้าสินค้า' },
  { value: 'Others', label: 'อื่น ๆ' },
  { value: 'All', label: 'ทั้งหมด' },
]

export type TFreeItemSearchFilters = Omit<TFreeItemSearchParams, 'compType' | 'compCode'>

/**
 * Search is explicit (button-triggered), not typed-as-you-go: itemRema is required by the
 * endpoint and results are flat per-(orderNumb, receNumb, goodCode) lines, so a single order
 * can contribute multiple pickable rows — selection is keyed by that triple.
 */
@Component({
  selector: 'other-income-append-free-item',
  imports: [DecimalPipe, DatePipe, FormsModule, DateInputComponent],
  templateUrl: './append-free-item.component.html',
  styles: '',
})
export class AppendFreeItemComponent {
  private readonly calendar = inject(NgbCalendar)

  submitting = input(false)
  search = input.required<(filters: TFreeItemSearchFilters) => Observable<TFreeItemOrderLine[]>>()

  submitFreeItems = output<TPostFreeItemReq[]>()

  itemRemaOptions = ITEM_REMA_OPTIONS

  itemRema = signal<TItemRema>('All')
  order = signal('')
  orderStart = signal<NgbDateStruct>(this.calendar.getToday())
  orderEnd = signal<NgbDateStruct>(this.calendar.getToday())

  searching = signal(false)
  results = signal<TFreeItemOrderLine[]>([])
  pending = signal<TFreeItemOrderLine[]>([])

  canSubmit = computed(() => this.pending().length > 0 && !this.submitting())

  private key(row: TFreeItemOrderLine): string {
    return `${row.orderNumb}::${row.receNumb}::${row.goodCode}`
  }

  isPicked(row: TFreeItemOrderLine): boolean {
    const key = this.key(row)
    return this.pending().some(p => this.key(p) === key)
  }

  onSearch(): void {
    this.searching.set(true)
    const filters: TFreeItemSearchFilters = {
      itemRema: this.itemRema(),
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

  toggleRow(row: TFreeItemOrderLine, checked: boolean): void {
    const key = this.key(row)
    if (checked) {
      if (!this.isPicked(row)) this.pending.update(prev => [...prev, row])
    } else {
      this.pending.update(prev => prev.filter(p => this.key(p) !== key))
    }
  }

  removePending(row: TFreeItemOrderLine): void {
    const key = this.key(row)
    this.pending.update(prev => prev.filter(p => this.key(p) !== key))
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const reqs = this.pending().map(({ orderNumb, receNumb, goodCode, incentiveAmount, remark }) => ({
      orderNumb, receNumb, goodCode, subtotalAmount: incentiveAmount, remark,
    }))
    this.submitFreeItems.emit(reqs)
  }

  reset(): void {
    this.results.set([])
    this.pending.set([])
  }
}
