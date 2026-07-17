import { Component, input, output } from '@angular/core';
import { TExtendedIncomeItem, TIncomeItem } from '../../../service/other-income/base-oi';
import { customFormatMonth } from '../../../lib/formatter';

type TDualIncomeRow = TIncomeItem & { compType: 'DN' | 'HU' }

@Component({
  selector: 'app-other-income-dual-monthly-list',
  imports: [],
  template: `
    <table class="table">
      <thead>
        <tr>
          <th>งวด</th>
          <th>บริษัท</th>
          <th>ยอดบันทึก</th>
          <th>cn</th>
          <th>รายได้</th>
          <th>หมายเหตุ</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        @for (row of incomeList(); track row.id) {
          <tr>
            <td>{{ formatMonth(row.startDate) }}</td>
            <td>{{ row.compType }}</td>
            <td>{{ fmt(row.actualAmount) }}</td>
            <td>{{ fmt(row.cn) }}</td>
            <td>{{ fmt(row.incomeAmount) }}</td>
            <td>{{ row.reason }}</td>
            <td></td>
          </tr>
        } @empty {
          <tr><td colspan="7" class="text-center text-muted">ไม่มีข้อมูล</td></tr>
        }
      </tbody>
    </table>
  `
})
export class OtherIncomeDualMonthlyListComponent {
  incomeList = input.required<TExtendedIncomeItem[]>()
  success = output<string>()
  fail = output<string>()

  readonly formatMonth = customFormatMonth
  readonly fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

}
