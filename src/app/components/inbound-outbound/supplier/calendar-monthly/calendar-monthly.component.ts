import { Component, computed, contentChild, effect, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { genCalendar, TDate } from '../../../../lib';
import { CalendarCellComponent } from "../calendar-cell/calendar-cell.component";
import { NgbCalendar, NgbDate, NgbDatepicker, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DoorService } from '../../../../service/ibob/door.service';
import { single } from 'rxjs';
import { MonthlyCalendarService } from '../../../../service/ibob/monthly-calendar.service';
import { DailyCalendarService } from '../../../../service/ibob/daily-calendar.service';
import { TMaybe } from '../../../../types';

@Component({
  selector: 'app-calendar-monthly',
  imports: [CalendarCellComponent, NgbDatepickerModule, FormsModule],
  templateUrl: './calendar-monthly.component.html',
  styleUrl: './calendar-monthly.component.scss'
})
export class CalendarMonthlyComponent {
  constructor() {
    const doorEff = effect(() => this.monthServ.setDoor(this.doorList()))
    const dateEff = effect(() => this.monthServ.setMonth(this.formated()))
  }
  private monthServ = inject(MonthlyCalendarService)
  calendar = this.monthServ.fullCalendar

  primaryModal = viewChild('primaryModal')
  secondaryModal = viewChild('secondaryModal')

  private modalService = inject(NgbModal);

  private doorServ = inject(DoorService)
  doorList = this.doorServ.doorList
  selectedDoor = this.doorServ.selectedDoor
  toggleDoor = this.doorServ.toggleDoor

  private defaultDate = new Date().toISOString().split('T')[0].substring(0, 7)

  temp = signal(this.defaultDate)

  formated = computed(() => {
    const str = this.temp()
    const [year, month] = str.split('-').flatMap((x) => {
      const castNumb = Number(x)
      return isNaN(castNumb) ? [] : [castNumb]
    })
    return { year, month }
  })

  private dailyServ = inject(DailyCalendarService)

  secondaryModalSelectedDoor = signal<TMaybe<string>>(null)

  displayTimeSlot = this.dailyServ.reseavationList

  doorStat = computed(() => this.selectedDoor().map(({ doorId, name }) => {
    const statusList = this.dailyServ.allDoorStat()
    const stat = statusList.find((s) => String(s.doorId) === doorId)
    return { doorId, name, status: stat ? stat.status : -1 }
  }))


  openPrimaryModal = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-').map(Number)
    this.dailyServ.setDate({ year, month, day })
    this.modalService.open(this.primaryModal())
  }

  openSecondaryModal = (doorName: string, doorId: string) => {
    this.dailyServ.setDoorId(doorId, doorName)
    this.modalService.open(this.secondaryModal())
  }

  slotClass = (compCode: string | null) => {
    return compCode === null ? 'bg-color-green' : 'bg-color-red'
  }

  indicatoreClass = (status: number) => {
    switch (status) {
      case 0: return 'indicator bg-color-green'
      case 1: return 'indicator bg-color-yellow'
      case 2: return 'indicator bg-color-red'
      default: return 'indicator bg-color-green'
    }
  }

  currentDate = this.dailyServ.currentDate
  currentThaiDate = computed(() => {
    const { year, month, day } = this.currentDate()
    return `${day}/${month}/${year}`
  })
  targetDoor = this.dailyServ.doorName
}
