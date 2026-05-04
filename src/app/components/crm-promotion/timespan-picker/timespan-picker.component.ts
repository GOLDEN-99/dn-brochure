import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { TTimeSpan } from '../../../types/crm-promotion.type';

@Component({
  selector: 'app-timespan-picker',
  imports: [NgbTimepicker, FormsModule],
  templateUrl: './timespan-picker.component.html',
  styleUrl: './timespan-picker.component.scss',
})
export class TimespanPickerComponent {
  required = input(false)
  limitTime = model.required<boolean>()
  timeSpan = model.required<TTimeSpan>()
  updateTimespan(key : keyof TTimeSpan, event: NgbTimeStruct){
      this.timeSpan.update(prev => ({...prev, [key] : event}))
  }
}
