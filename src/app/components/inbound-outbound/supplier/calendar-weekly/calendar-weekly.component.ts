import { Component, inject, OnInit } from '@angular/core';
import { CalendarCellComponent } from '../calendar-cell/calendar-cell.component';
import { getWeekRange, TDate } from '../../../../lib';
import { NgbCalendar, NgbDate, NgbDatepicker, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-calendar-weekly',
  imports: [CalendarCellComponent, NgbDatepickerModule],
  templateUrl: './calendar-weekly.component.html',
  styleUrl: './calendar-weekly.component.scss'
})
export class CalendarWeeklyComponent implements OnInit {
  week: TDate[] = [
    { day: 4, month: 5, year: 2025 },
    { day: 5, month: 5, year: 2025 },
    { day: 6, month: 5, year: 2025 },
    { day: 7, month: 5, year: 2025 },
    { day: 8, month: 5, year: 2025 },
    { day: 9, month: 5, year: 2025 },
    { day: 10, month: 5, year: 2025 }
  ]

  ngOnInit(): void {
    const todayDate = this.calendar.getToday()

  }

  calendar = inject(NgbCalendar);
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.fromDate, 'd', 10);

  onDateSelection(date: NgbDate) {
    const wk = getWeekRange(date)
    console.log(wk)
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }
}
