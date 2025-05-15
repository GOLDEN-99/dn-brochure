import { Component, computed, effect, inject, signal, TemplateRef } from '@angular/core';
import { genCalendar, TDate } from '../../../../lib';
import { CalendarCellComponent } from "../calendar-cell/calendar-cell.component";
import { NgbCalendar, NgbDate, NgbDatepicker, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DoorService } from '../../../../service/ibob/door.service';
import { single } from 'rxjs';
import { MonthlyCalendarService } from '../../../../service/ibob/monthly-calendar.service';

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

  private modalService = inject(NgbModal);
  openMonthly1 = (date: TDate, content: TemplateRef<any>) => {

  }

  private doorServ = inject(DoorService)
  doorList = this.doorServ.doorList
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

}
