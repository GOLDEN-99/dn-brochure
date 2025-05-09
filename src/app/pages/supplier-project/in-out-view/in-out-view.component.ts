import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarMonthlyComponent } from "../../../components/supplier/calendar-monthly/calendar-monthly.component";
import { CalendarDailyComponent } from "../../../components/supplier/calendar-daily/calendar-daily.component";
import { CalendarWeeklyComponent } from '../../../components/supplier/calendar-weekly/calendar-weekly.component';

@Component({
  selector: 'app-in-out-view',
  imports: [FormsModule, CalendarMonthlyComponent, CalendarWeeklyComponent, CalendarDailyComponent],
  templateUrl: './in-out-view.component.html',
  styleUrl: './in-out-view.component.scss'
})
export class InOutViewComponent {

  mode = signal<1 | 2 | 3>(1)
  ref = [{ value: 1, label: 'รายเดือน' }, { value: 2, label: 'รายสัปดาห์' }, { value: 3, label: 'รายวัน' },]



}
