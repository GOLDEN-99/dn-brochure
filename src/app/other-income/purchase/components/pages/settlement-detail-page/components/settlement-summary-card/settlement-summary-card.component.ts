import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TSettlementDetail } from '../../../../../../shared/types/other-income.type';

export type SettlementBalance = {
  remaining: number
  state: 'OUTSTANDING' | 'SETTLED'
  label: string
}

@Component({
  selector: 'app-settlement-summary-card',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './settlement-summary-card.component.html',
})
export class SettlementSummaryCardComponent {
  settlement = input.required<TSettlementDetail>()
  balance = input<SettlementBalance | null>(null)
  isAccount = input(false)

  deleteSettlement = output<void>()
}
