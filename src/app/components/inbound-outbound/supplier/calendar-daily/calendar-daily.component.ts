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

  onSelectDate(date: NgbDate) {
    console.log(date)
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
    return arg[col].status ?? 0 as number
  }

  thaiDate(date: NgbDateStruct | null) {
    if (!date) return "กรุณาเลือกวันที่"
    return `${date.day}/${date.month}/${date.year}`
  }
  private modalServ = inject(NgbModal)
  dailyModal = viewChild('dailyModal')
  openModal = (doorName: string, time: string) => {
    const targetDoor = this.doorList().find(({ doorId, name, check }) => name === doorName && check)
    if (!targetDoor) return
    this.selectTime.set(time)
    this.dailyServ.setDoorId(targetDoor.doorId, targetDoor.name)
    this.modalServ.open(this.dailyModal(), {})
  }
  currentThaiDate = computed(() => this.thaiDate(this.currentDate()))
  targetDoor = this.dailyServ.doorName
  selectTime = signal<string | null>(null)
  slotContent = computed(
    () => this.dailyServ.reseavationList()
      .flatMap(({ reservationTime, compCode, ...res }) =>
        reservationTime.substring(0, 2) === (this.selectTime() ?? '').substring(0, 2) && compCode !== null
          ? [{ ...res, compCode, reservationTime: reservationTime.substring(0, 5) }]
          : []
      ))
  slotClass = (compCode: string | null) => compCode === null ? 'bg-color-green' : 'bg-color-red'
}
