import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TDayState } from '../../../types/crm-promotion.type';

@Component({
  selector: 'app-day-checkboox',
  imports: [FormsModule],
  templateUrl: './day-checkboox.component.html',
  styleUrl: './day-checkboox.component.scss'
})
export class DayCheckbooxComponent {
  activeDay = input.required<TDayState>()
  allowEveryDay = computed(() => this.activeDay().reduce((acc, cur) => acc && cur, true))
  changeActiveDay = output<TDayState>()
  readonly dateRef = [
    "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"
  ]


  toggleEveryDay(eve: boolean) {
    this.changeActiveDay.emit(Array.from({ length: 7 }).map((_) => eve) as TDayState)
  }

  toggleDayByDay(eve: boolean, idx: number) {
    const current = this.activeDay()
    this.changeActiveDay.emit(current.map((d, i) => i === idx ? eve : d) as TDayState)
  }
}