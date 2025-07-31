import { Component, input } from '@angular/core';

@Component({
  selector: 'app-other-income-report',
  imports: [],
  templateUrl: './other-income-report.component.html',
  styleUrl: './other-income-report.component.scss'
})
export class OtherIncomeReportComponent {
  year = input<string>()
  monthList = [...Array(12)].map((_, i) => i + 1)

  invoiceMap = new Map<number, number[]>([
    [1, [20_000, 30_000, 25_000, 30_000, 20_000, 18_000]],
    [2, [20_000, 30_000, 25_000, 30_000, 20_000, 18_000]]
  ])

  getInv = (id: number, month: number) => {
    const value = this.invoiceMap.get(id)
    return value?.[month] ?? 0
  }

  receiptMap = new Map<number, number[]>([
    [1, [20_000, 30_000, 25_000, 30_000, 20_000, 18_000]],
    [2, [20_000, 30_000, 25_000, 30_000, 20_000, 18_000]]
  ])

  getRece = (id: number, month: number) => {
    const value = this.receiptMap.get(id)
    return value?.[month] ?? 0
  }

  saleMap = new Map<number, number[]>([
    [1, [20_000, 30_000, 25_000, 30_000, 20_000, 18_000]],
    [2, [20_000, 30_000, 25_000, 30_000, 20_000, 18_000]]
  ])

  getSale = (id: number, month: number) => {
    const value = this.saleMap.get(id)
    return value?.[month] ?? 0
  }

  otherIncomeList = [
    {
      id: 1,
      comp: "sup 1",
      startDate: '2025-01-01',
      endDate: "2025-12-16",
      discountId: 1,
      discountName: "ไม่ลด",
      eventName: "rebate"
    },
    {
      id: 2,
      comp: "sup2",
      startDate: '2025-12-01',
      endDate: "2025-12-16",
      discountId: 2,
      discountName: "ท้ายบิล",
      eventName: "rebate"
    }
  ]

}
