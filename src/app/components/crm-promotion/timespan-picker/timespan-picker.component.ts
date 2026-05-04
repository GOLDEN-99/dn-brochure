import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-timespan-picker',
  imports: [NgbTimepicker, FormsModule],
  templateUrl: './timespan-picker.component.html',
  styleUrl: './timespan-picker.component.scss',
})
export class TimespanPickerComponent {
  limitTime = model.required<boolean>()
  startTime = model.required<NgbTimeStruct>()
  endTime = model.required<NgbTimeStruct>()
}
