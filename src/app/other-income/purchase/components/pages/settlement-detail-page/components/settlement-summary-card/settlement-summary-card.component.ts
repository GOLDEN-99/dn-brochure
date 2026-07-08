import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TSettlementDetail } from '../../../../../../shared/types/other-income.type';

export type SettlementBalance = {
  remaining: number
  state: 'OUTSTANDING' | 'SETTLED'
  label: string
}

@Component({
  selector: 'app-settlement-summary-card',
  imports: [DatePipe],
  templateUrl: './settlement-summary-card.component.html',
})
export class SettlementSummaryCardComponent {
  settlement = input.required<TSettlementDetail>()
  balance = input<SettlementBalance | null>(null)

  deleteSettlement = output<void>()
}
