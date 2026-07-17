import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../../../service/other-income/income.service';

@Component({
  selector: 'app-income-select',
  imports: [FormsModule],
  template: `<div class="app-form-select">
  <label [for]="'income-select-' + incomeType()">{{ label() }}</label>
  <select
    [name]="'income-select-' + incomeType()"
    [id]="'income-select-' + incomeType()"
    [ngModel]="incomeId()"
    (ngModelChange)="onChange($event)"
  >
    <option [ngValue]="0" disabled>กรุณาเลือก</option>
    @for (item of renderList(); track item.id) {
      <option [ngValue]="item.id">{{item.incomeName}}</option>
    }
  </select>
</div>`,
  styles: ``
})
export class IncomeSelectComponent {
  incomeId = input.required<number>()
  incomeType = input.required<number>()
  incomeIdChange = output<number>()
  private readonly incomeServ = inject(IncomeService)
  renderList = computed(() => this.incomeServ.income().filter(i => i.incomeType === this.incomeType()))
  label = computed(() => {
    switch (this.incomeType()) {
      case 1: return 'ส่วนลด'
      case 2: return 'สินค้า'
      case 3: return 'ใบแจ้งหนี้'
      case 4: return 'ใบลดหนี้'
      default: return 'ประเภทรับรู้รายได้'
    }
  })
  onChange(id: number) {
    if (id === 0) return
    this.incomeIdChange.emit(id)
  }
}
