import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-month-select',
  imports: [FormsModule],
  template: `
  <div class="app-form-select">
    <label for="month-select">เดือน</label>
    <select
      name="month-select"
      id="month-select"
      [ngModel]="month()"
      (ngModelChange)="monthChange.emit($event)"
    >
      @for (month of ref; track $index) {
      <option [ngValue]="$index + 1">{{ month }}</option>
      }
    </select>
  </div>
  `,
  styles: ''
})
export class MonthSelectComponent {
  private calServ = inject(NgbCalendar)
  private currentMonth = this.calServ.getToday().month
  month = input(this.currentMonth)
  monthChange = output<number>()
  ref = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฏาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
}
