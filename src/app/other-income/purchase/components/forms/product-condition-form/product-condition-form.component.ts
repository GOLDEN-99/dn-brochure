import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TExcludeFlagsForm } from '../../forms/create-schema';

@Component({
  selector: 'other-income-product-condition-form',
  imports: [FormField],
  templateUrl: './product-condition-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: '',
})
export class ProductConditionFormComponent {
  excludeFlagsForm = input.required<FieldTree<TExcludeFlagsForm>>()
}
