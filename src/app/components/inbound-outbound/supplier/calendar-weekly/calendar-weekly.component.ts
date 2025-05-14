import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CalendarCellComponent } from '../calendar-cell/calendar-cell.component';
import { getWeekRange, TDate } from '../../../../lib';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepicker, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

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
    this.selectedDate.set(this.calendar.getToday())
  }
  formatter = inject(NgbDateParserFormatter);
  calendar = inject(NgbCalendar);
  hoveredDate: NgbDate | null = null;

  selectedDate = signal<NgbDate | null>(null)
  dateRange = computed(() => {
    const date = this.selectedDate()
    if (!date) return { start: null, end: null }
    return getWeekRange(date)
  })

  onDateSelection(date: NgbDate) {
    this.selectedDate.set(date)
    const wk = getWeekRange(date)
    console.log(wk)
  }

  isHovered(date: NgbDate) {
    const { start, end } = this.dateRange()
    return (
      start && !end && this.hoveredDate && date.after(start) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    const { start, end } = this.dateRange()
    return end && date.after(start) && date.before(end);
  }

  isRange(date: NgbDate) {
    const { start, end } = this.dateRange()
    return (
      date.equals(start) ||
      (end && date.equals(end)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  isOtherMonth(date: NgbDate) {
    const ref = this.selectedDate()
    const month = ref?.month
    return date.month !== month
  }

  thaiDate(date: NgbDateStruct | null) {
    if (!date) return "กรุณาเลือกวันที่"
    return `${date.day}/${date.month}/${date.year}`
  }
}
