import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { DoorService } from '../../../../service/ibob/door.service';
import { DailyCalendarService } from '../../../../service/ibob/daily-calendar.service';
import { FormsModule } from '@angular/forms';
import { CalendarCellComponent } from "../calendar-cell/calendar-cell.component";
import { NgbAlertModule, NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

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
}
