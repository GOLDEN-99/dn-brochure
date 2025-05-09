import { Component, computed, input, output, signal } from '@angular/core';
import { TDate } from '../../../../lib';

@Component({
  selector: 'app-calendar-cell',
  imports: [],
  templateUrl: './calendar-cell.component.html',
  styleUrl: './calendar-cell.component.scss'
})
export class CalendarCellComponent {

  date = input.required<TDate>()

  month = input.required<number>()

  color = input<number>(0)

  indicatorClass = computed(() => {
    const color = this.color()
    switch (color) {
      case 0: return 'indicator bg-color-green'
      case 1: return 'indicator bg-color-yellow'
      case 2: return 'indicator bg-color-red'
      default: return 'indicator bg-color-red'
    }
  })

  indicatorLabel = computed(() => {
    const color = this.color()
    switch (color) {
      case 0: return 'ไม่มีการจอง'
      case 1: return 'จองบางส่วน'
      case 2: return 'จองเต็ม'
      default: return 'มีข้อผิดพลาด'
    }
  })

  onClick = output<TDate>()

  handleClick = () => this.onClick.emit(this.date())

  inActive = computed(() => this.date().month !== this.month())

  inActiveClass = computed(() => this.inActive() ? 'calendar-cell inactive' : 'calendar-cell')
}
