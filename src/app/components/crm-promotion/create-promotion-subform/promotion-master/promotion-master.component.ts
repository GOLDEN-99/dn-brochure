import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TPromotionMaster } from '../../../../types/crm-promotion.type';
import { SignalDatepickerComponent } from '../../signal-datepicker.component';

@Component({
  selector: 'app-promotion-master',
  imports: [FormField, SignalDatepickerComponent],
  templateUrl: './promotion-master.component.html',
  styles: '',
})
export class PromotionMasterComponent {
  form = input.required<FieldTree<TPromotionMaster>>()
}
