import { Component, computed, effect, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { DoorService } from '../../../../service/ibob/door.service';
import { DailyCalendarService } from '../../../../service/ibob/daily-calendar.service';
import { FormsModule } from '@angular/forms';
import { CalendarCellComponent } from "../calendar-cell/calendar-cell.component";
import { NgbAlertModule, NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-calendar-daily',
  imports: [NgbDatepickerModule, NgbAlertModule, FormsModule, CalendarCellComponent],
  templateUrl: './calendar-daily.component.html',
  styleUrl: './calendar-daily.component.scss'
})
export class CalendarDailyComponent {

  constructor() {
    const doorEff = effect(() => this.dailyServ.setDoor(this.doorList()))
  }

  formatter = inject(NgbDateParserFormatter);

  private doorServ = inject(DoorService)
  private dailyServ = inject(DailyCalendarService)
  doorList = this.doorServ.doorList
  toggleDoor = this.doorServ.toggleDoor
  currentDate = this.dailyServ.currentDate

  header = this.dailyServ.refArr
  displayList = this.dailyServ.displayDoors

  getStatus = (arg: any) => (col: string) => {
    return arg[col]?.status ?? 0 as number
  }

  thaiDate(date: NgbDateStruct | null) {
    if (!date) return "กรุณาเลือกวันที่"
    return `${date.day}/${date.month}/${date.year}`
  }
  private modalServ = inject(NgbModal)
  dailyModal = viewChild('dailyModal')
  openModal = (door: { doorId: string, name: string }, slot: { time: string, min: number }) => {
    const targetDoor = this.doorList().find(({ doorId, check }) => doorId === door.doorId && check)
    if (!targetDoor) return
    this.selectMin.set(slot.min)
    this.selectTime.set(slot.time)
    this.dailyServ.setDoorId(targetDoor.doorId, targetDoor.name)
    this.modalServ.open(this.dailyModal(), {})
  }
  currentThaiDate = computed(() => this.thaiDate(this.currentDate()))
  targetDoor = this.dailyServ.doorName
  selectTime = signal<string | null>(null)
  selectMin = signal<number>(0)
  slotContent = computed(
    () => {
      const selectMin = this.selectMin()
      return this.dailyServ.reseavationList()
        .flatMap(({ reservationTime, min, compCode, ...res }) =>
          selectMin <= min && selectMin + 60 > min
            ? [{ ...res, compCode, reservationTime: reservationTime.substring(0, 5) }]
            : []
        )
    }
  )
  slotClass = (compCode: string | null) => compCode === null ? 'bg-color-green' : 'bg-color-red'
}
