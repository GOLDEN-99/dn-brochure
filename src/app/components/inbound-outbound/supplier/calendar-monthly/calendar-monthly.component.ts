import { Component, computed, inject, signal, TemplateRef } from '@angular/core';
import { genCalendar, TDate } from '../../../../lib';
import { CalendarCellComponent } from "../calendar-cell/calendar-cell.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-calendar-monthly',
  imports: [CalendarCellComponent],
  templateUrl: './calendar-monthly.component.html',
  styleUrl: './calendar-monthly.component.scss'
})
export class CalendarMonthlyComponent {
  month = signal(4)
  year = signal(2025)
  calendar = computed(() => genCalendar({ month: this.month(), year: this.year() }))

  toNextMonth = () => {
    const cm = this.month()
    const cy = this.year()
    const nextMo = cm === 12 ? 1 : cm + 1
    const nextYe = cm === 12 ? cy + 1 : cy
    this.month.set(nextMo)
    this.year.set(nextYe)
  }

  toPrevMonth = () => {
    const cm = this.month()
    const cy = this.year()
    const prevMo = cm === 1 ? 12 : cm - 1
    const prevYe = cm === 1 ? cy - 1 : cy
    this.month.set(prevMo)
    this.year.set(prevYe)
  }
  month1Header = signal("")
  month1List = signal([])
  private modalService = inject(NgbModal);
  openMonthly1 = (date: TDate, content: TemplateRef<any>) => {

  }

  formatIso = ({ year, month, day }: TDate) => `${year}-${month}-${day}`
}
