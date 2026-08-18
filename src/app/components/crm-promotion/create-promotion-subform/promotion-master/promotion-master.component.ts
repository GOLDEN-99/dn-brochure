import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TPromotionMaster } from '../../../../types/crm-promotion.type';
import { SignalDatepickerComponent } from '../../signal-datepicker.component';
import { FormAlertTextComponent } from "../../form-alert-text.component";
import { PromotionSourcePipe } from '../../../../lib/crm-promotion/promotion-source.pipe';

@Component({
  selector: 'app-promotion-master',
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent, PromotionSourcePipe],
  templateUrl: './promotion-master.component.html',
  styles: '',
})
export class PromotionMasterComponent {
  form = input.required<FieldTree<TPromotionMaster>>()
  promotionSourceOptions = ['HU', 'SUPPLIER', 'BOTH'] as const

  // Health Up promotions always compute last. The order select is disabled for HU,
  // so without this reset it keeps whatever was picked under another source.
  onSourceChange(source: string) {
    if (source !== 'HU') return
    this.form().promotionOrder().controlValue.set('0')
  }
}
