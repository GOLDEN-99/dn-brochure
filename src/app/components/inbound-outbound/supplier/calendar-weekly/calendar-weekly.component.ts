import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CalendarCellComponent } from '../calendar-cell/calendar-cell.component';
import { getWeekRange } from '../../../../lib';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { WeekCalendarService } from '../../../../service/ibob/week-calendar.service';
import { DoorService } from '../../../../service/ibob/door.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar-weekly',
  imports: [CalendarCellComponent, NgbDatepickerModule, FormsModule],
  templateUrl: './calendar-weekly.component.html',
  styleUrl: './calendar-weekly.component.scss'
})
export class CalendarWeeklyComponent implements OnInit {

  constructor() {
    const weekEff = effect(() => this.calServ.setWeek(this.dateRange()))
    const doorEff = effect(() => this.calServ.setDoor(this.doorList()))
  }

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

  private calServ = inject(WeekCalendarService)
  private doorServ = inject(DoorService)

  week = this.calServ.weeklyReservation

  doorList = this.doorServ.doorList

  toggleDoor = this.doorServ.toggleDoor

  formateMonth = (iso: string) => Number(iso.split('-')[1])

  displayList = this.calServ.displayWeekly

  header = this.calServ.header
}
