import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TDayState } from '../../../types/crm-promotion.type';

@Component({
  selector: 'app-day-checkboox',
  imports: [FormsModule],
  templateUrl: './day-checkboox.component.html',
  styleUrl: './day-checkboox.component.scss'
})
export class DayCheckbooxComponent {
  activeDay = model.required<TDayState>()
  allowEveryDay = computed(() => this.activeDay().reduce((acc, cur) => acc && cur, true))
  readonly dateRef = [
    "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"
  ]


  toggleEveryDay(eve: boolean) {
    this.activeDay.set(Array.from({ length: 7 }).map((_) => eve) as TDayState)
  }

  toggleDayByDay(eve: boolean, idx: number) {
    this.activeDay.update(prev => prev.map((d, i) => i === idx ? eve : d) as TDayState)
  }
}