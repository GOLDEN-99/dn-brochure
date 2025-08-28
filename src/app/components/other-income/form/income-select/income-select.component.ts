import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IncomeService, TIncome } from '../../../../service/other-income/income.service';

@Component({
  selector: 'app-income-select',
  imports: [FormsModule],
  template: `<div class="app-form-select">
  <label for="event-select">เลือกประเภทรับรู้รายได้</label>
  <select
    name="event-select"
    id="event-select"
    [ngModel]="incomeId()"
    (ngModelChange)="onChange($event)"
  >
    <option [ngValue]="0" disabled>กรุณาเลือก</option>
    @for (item of renderList(); track item.id) {
      <option [ngValue]="item.id" >{{item.incomeName}}</option>
    }
  </select>
</div>`,
  styles: ``
})
export class IncomeSelectComponent {
  incomeId = input.required<number>()
  incomeIdChange = output<number>()
  isProductChange = output<number>()
  private incomeServ = inject(IncomeService)
  renderList = this.incomeServ.income
  onChange(id: number) {
    if (id === 0) return
    const value = this.incomeServ.getValue(id)
    this.incomeIdChange.emit(id)
    this.isProductChange.emit(value.incomeType)
  }
}
