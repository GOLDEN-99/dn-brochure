import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
  selector: 'other-income-product-condition-form',
  imports: [FormField],
  templateUrl: './product-condition-form.component.html',
  styles: '',
})
export class ProductConditionFormComponent {
  productConditionForm = input.required<FieldTree<TOtherIncomeProductConditionFormState>>()
}
type TOtherIncomeProductConditionFormState = {
  isDc: boolean
  isRebate: boolean
  isComp: boolean
  isInce: boolean
  exVat: boolean // ! vincVat
}