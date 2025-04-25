import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarMonthlyComponent } from "../../../components/calendar/calendar-monthly/calendar-monthly.component";

@Component({
  selector: 'app-in-out-view',
  imports: [FormsModule, CalendarMonthlyComponent],
  templateUrl: './in-out-view.component.html',
  styleUrl: './in-out-view.component.scss'
})
export class InOutViewComponent {

  mode = signal<1 | 2 | 3>(1)
  ref = [{ value: 1, label: 'รายเดือน' }, { value: 2, label: 'รายสัปดาห์' }, { value: 3, label: 'รายวัน' },]



}
