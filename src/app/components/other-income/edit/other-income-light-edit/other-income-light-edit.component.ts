import { DecimalPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-other-income-light-edit',
  imports: [DecimalPipe],
  templateUrl: './other-income-light-edit.component.html',
  styleUrl: './other-income-light-edit.component.scss'
})
export class OtherIncomeLightEditComponent {
  eventDetail = input.required<TOiLEditProps>()
  totalIncome = input.required<number>()
  branchText = computed(() => { const { totalBranch, currentBranch } = this.eventDetail(); return `${currentBranch}/${totalBranch}` })
  openModal() { }
}

type TOiLEditProps = {
  totalBranch: number
  totalAmount: number
  currentBranch: number
}
