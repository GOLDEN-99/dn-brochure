import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { TPromotionDatetime } from '../../../../types/crm-promotion.type';
import { DayCheckbooxComponent } from "../../day-checkboox/day-checkboox.component";
import { TimespanPickerComponent } from "../../timespan-picker/timespan-picker.component";
import { FormAlertTextComponent } from '../../form-alert-text.component';

@Component({
  selector: 'app-promotion-datetime',
  imports: [DayCheckbooxComponent, TimespanPickerComponent, FormAlertTextComponent],
  templateUrl: './promotion-datetime.component.html',
  styles: '',
})
export class PromotionDatetimeComponent {
  readonly dateRef = [
    "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"
  ]

  form = input.required<FieldTree<TPromotionDatetime>>()
}
