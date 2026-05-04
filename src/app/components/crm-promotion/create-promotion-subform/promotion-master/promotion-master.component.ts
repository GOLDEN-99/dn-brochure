import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TPromotionMaster } from '../../../../types/crm-promotion.type';

@Component({
  selector: 'app-promotion-master',
  imports: [FormField],
  templateUrl: './promotion-master.component.html',
  styleUrl: './promotion-master.component.scss',
})
export class PromotionMasterComponent {
  form = input.required<FieldTree<TPromotionMaster>>()
}
