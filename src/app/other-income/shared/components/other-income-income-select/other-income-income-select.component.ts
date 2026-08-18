import { Component, computed, inject, input } from '@angular/core';
import { SelectComponent } from "../../../../shared/components/select/select.component";
import { FieldTree, FormField } from '@angular/forms/signals';
import { TIncomeLabel, TIncomeLabelType } from '../../types/other-income.type';
import { OtherIncomeIncomeService } from '../../services/other-income-income.service';
import { OptionComponent } from '../../../../shared/components/select/option.component';

@Component({
  selector: 'other-income-income-select',
  imports: [SelectComponent, OptionComponent, FormField],
  templateUrl: './other-income-income-select.component.html',
  styleUrl: './other-income-income-select.component.scss',
})
export class OtherIncomeIncomeSelectComponent {
  private readonly otherIncomeIncome = inject(OtherIncomeIncomeService);
  incomeList = this.otherIncomeIncome.income;
  incomeType = input<TIncomeLabelType | null>(null);
  label = computed(() => {
    switch (this.incomeType()) {
      case 'Bill': return 'ส่วนลด'
      case 'FreeItem': return 'สินค้า'
      case 'Invoice': return 'ใบแจ้งหนี้'
      case 'CreditNote': return 'ใบลดหนี้'
      default: return 'รายได้'
    }
  })
  renderIncome = computed(() => this.incomeList()
    .filter((income) => !this.incomeType() || income.incomeType === this.incomeType())
  )
  form = input.required<FieldTree<TIncomeLabel | null, string>>();
}
