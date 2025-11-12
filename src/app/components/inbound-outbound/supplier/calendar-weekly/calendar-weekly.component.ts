import { Component, computed, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { CalendarCellComponent } from '../calendar-cell/calendar-cell.component';
import { getWeekRange } from '../../../../lib';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WeekCalendarService } from '../../../../service/ibob/week-calendar.service';
import { DoorService } from '../../../../service/ibob/door.service';
import { FormsModule } from '@angular/forms';
import { DailyCalendarService } from '../../../../service/ibob/daily-calendar.service';

@Component({
  selector: 'app-calendar-weekly',
  imports: [CalendarCellComponent, NgbDatepickerModule, FormsModule],
  templateUrl: './calendar-weekly.component.html',
  styleUrl: './calendar-weekly.component.scss'
})
export class CalendarWeeklyComponent {

  constructor() {
    const doorEff = effect(() => this.calServ.setDoor(this.doorList()))
    const eff = effect(() => this.dailyServ.setDoor(this.doorList()))
  }

  private calServ = inject(WeekCalendarService)
  private doorServ = inject(DoorService)
  private modalServ = inject(NgbModal)
  formatter = inject(NgbDateParserFormatter);
  hoveredDate: NgbDate | null = null;

  selectedDate = this.calServ.selectedDate
  dateRange = this.calServ.dateRange


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



  week = this.calServ.weeklyReservation

  doorList = this.doorServ.doorList

  toggleDoor = this.doorServ.toggleDoor

  formateMonth = (iso: string) => Number(iso.split('-')[1])

  displayList = this.calServ.displayWeekly

  header = this.calServ.header

  private dailyServ = inject(DailyCalendarService)
  selectTime = signal<string | null>(null)
  private primary = viewChild('primaryWeekModal')
  openPrimaryModal = (isoDate: string, time: string) => {
    this.selectTime.set(time)
    const [year, month, day] = isoDate.split('-').map(Number)
    this.dailyServ.setDate({ year, month, day })
    this.modalServ.open(this.primary(), {})
  }
  selectedDoor = this.doorServ.selectedDoor
  doorStat = computed(() => this.selectedDoor().map(({ doorId, name }) => {
    const statusList = this.dailyServ.allDoorStat()
    const stat = statusList.find((s) => String(s.doorId) === doorId)
    return { doorId, name, status: stat ? stat.status : -1 }
  }))
  indicatoreClass = (status: number) => {
    switch (status) {
      case 0: return 'indicator bg-color-green'
      case 1: return 'indicator bg-color-yellow'
      case 2: return 'indicator bg-color-red'
      default: return ''
    }
  }
  private secondary = viewChild('secondaryWeekModal')
  openSecondaryModal = (doorName: string) => {
    const targetDoor = this.doorList().find(({ doorId, name, check }) => name === doorName && check)
    if (!targetDoor) return
    this.dailyServ.setDoorId(targetDoor.doorId, targetDoor.name)
    this.modalServ.open(this.secondary(), {})
  }
  doorContent = computed(() => this.dailyServ.filterDoor().filter(({ time }) => time === this.selectTime()))
  slotContent = computed(
    () => this.dailyServ.reseavationList()
      .flatMap(({ reservationTime, compCode, ...res }) =>
        reservationTime.substring(0, 2) === (this.selectTime() ?? '').substring(0, 2) && compCode !== null
          ? [{ ...res, compCode, reservationTime: reservationTime.substring(0, 5) }]
          : []
      ))

  slotClass = (compCode: string | null) => compCode === null ? 'bg-color-green' : 'bg-color-red'

  secondaryDoor = this.dailyServ.doorName
  currentDate = this.dailyServ.currentDate
  currentThaiDate = computed(() => {
    const { year, month, day } = this.currentDate()
    return `${day}/${month}/${year}`
  })
}
