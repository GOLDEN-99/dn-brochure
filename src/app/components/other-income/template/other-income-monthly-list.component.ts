import { Component, computed, inject, input, output, Signal } from '@angular/core';
import { TEnchanceIncomeItem, TIncomeItem } from '../../../service/other-income/base-oi';
import { MonthlyService } from '../../../service/other-income/monthly.service';
import { TFieldSelector } from '../../../types';
import { customFormatDate, customFormatMonth } from '../../../lib/formatter';

@Component({
  selector: 'app-other-income-monthly-list',
  imports: [],
  template: `
    <table class="table">
    <thead>
      <tr>
        @for (header of tableHeader(); track $index) {
          <th>{{header}}</th>
        }
        <th></th>
      </tr>
    </thead>
    <tbody>
      @let incomes = computedIncomeList();
      @for (income of incomes;let i = $index; track i) {
      <tr>
        @for (fn of tableMapper();let j = $index; track j) {
          <td>{{fn(income)}}</td>
        }
        <td>
          @if (incomes.length -1 === $index && income.checkDate === null) {
          <button class="btn btn-danger" (click)="onDelete(income.id)">
            <i class="bi bi-trash"></i>
          </button>
          }
        </td>
      </tr>
      }
    </tbody>
  </table>
  `,
  styles: ''
})
export class OtherIncomeMonthlyListComponent {
  formatNumber = (v: number) => v.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  private _dcSelector: TFieldSelector<TEnchanceIncomeItem>[] = [
    { label: 'งวด', fn: v => this._formatMonth(v.startDate) },
    { label: 'ยอดคำนวน', fn: v => this.formatNumber(v.calAmount) },
    { label: 'ยอด cn', fn: v => this.formatNumber(v.cn) },
    { label: 'ยอดบันทึก', fn: v => this.formatNumber(v.actualAmount) },
    { label: 'ส่วนต่าง', fn: v => this.formatNumber(v.calAmount - v.cn - v.actualAmount) },
    { label: 'เหตุผล', fn: v => v.reason },
    { label: 'รายได้', fn: v => v.incomeAmount },
    { label: 'ยอดซื้อสะสม', fn: v => this.formatNumber(v.accPurchase) }
  ]
  private _notDcSelector: TFieldSelector<TEnchanceIncomeItem>[] = [
    { label: 'เริ่ม', fn: v => this._formatDate(v.startDate) },
    { label: 'จบ', fn: v => this._formatDate(v.endDate) },
    { label: 'หมายเหตุ', fn: v => v.reason },
    { label: 'รายได้', fn: v => v.incomeAmount },
    { label: 'ยอดซื้อสะสม', fn: v => this.formatNumber(v.accPurchase) }
  ]
  isDc = input.required<boolean>()
  private _selector = computed(() => this.isDc() ? this._dcSelector : this._notDcSelector)
  tableHeader = computed(() => this._selector().map(({ label }) => label))
  tableMapper = computed(() => this._selector().map(({ fn }) => fn))
  incomeList = input.required<TIncomeItem[]>()
  computedIncomeList: Signal<TEnchanceIncomeItem[]> = computed(() => {
    const incList = this.incomeList()
    let accPurchase = 0
    return incList.map(inc => ({
      ...inc, accPurchase: accPurchase += inc.actualAmount
    }))
  })
  success = output<string>()
  fail = output<string>()
  private monthService = inject(MonthlyService)
  private _formatMonth = customFormatMonth
  private _formatDate = customFormatDate
  onDelete(incId: number) {
    this.monthService.deleteMonthly(incId).subscribe({
      next: () => {
        this.success.emit('ลบสำเร็จ')
      },
      error: (err) => {
        this.fail.emit(err.message);
      }
    })
  }
}