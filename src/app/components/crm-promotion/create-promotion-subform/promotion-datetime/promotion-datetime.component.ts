import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TPromotionDatetime } from '../../../../types/crm-promotion.type';
import { DayCheckbooxComponent } from "../../day-checkboox/day-checkboox.component";
import { TimespanPickerComponent } from "../../timespan-picker/timespan-picker.component";
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-promotion-datetime',
  imports: [DayCheckbooxComponent, TimespanPickerComponent, FormsModule, JsonPipe],
  templateUrl: './promotion-datetime.component.html',
  styleUrl: './promotion-datetime.component.scss',
})
export class PromotionDatetimeComponent {
  readonly dateRef = [
    "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"
  ]

  form = input.required<FieldTree<TPromotionDatetime>>()
}
