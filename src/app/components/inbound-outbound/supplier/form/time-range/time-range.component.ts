import { Component, computed, effect, input, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { TMapForm } from '../../../../../types';

@Component({
  selector: 'app-time-range',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './time-range.component.html',
  styleUrl: './time-range.component.scss'
})
export class TimeRangeComponent {
  constructor() {
    const eff = effect(() => {
      const step = this.step()
      const start = this.selectedStart()
      this.selectEnd.set(null)
    })
  }
  form = input.required<FormGroup<TMapForm<{ from: NgbTimeStruct, to: NgbTimeStruct }>>>()
  startTime = input<NgbTimeStruct>({ hour: 8, minute: 0, second: 0 })
  step = input.required<number>()
  generateTimeSlot = (h: number, minute: number) => {
    let result = []
    for (let i = h; i < 18; i++) {
      if (i === 12) {

      } else if (i === h) {
        if (minute === 0) {
          result.push({ hour: i, minute: 0, second: 0 })
        }
        if (minute <= 30) {
          result.push({ hour: i, minute: 30, second: 0 })
        }
      } else {
        result.push({ hour: i, minute: 0, second: 0 })
        result.push({ hour: i, minute: 30, second: 0 })
      }
    }
    return result
  }
  possibleSlot = computed(() => {
    const { hour, minute } = this.startTime()
    return this.generateTimeSlot(hour, minute)
  })

  selectedStart = signal<NgbTimeStruct>(this.startTime())

  private genEnd = (hour: number, minunte: number, step: number) => {
    let result: NgbTimeStruct[] = []
    let hClone = hour
    let mClone = minunte
    while (hClone < 18) {
      const temp = mClone + step
      hClone = temp >= 60 ? hClone + 1 : hClone
      mClone = temp >= 60 ? temp - 60 : temp
      if (hClone === 12 && mClone !== 0) {
        hClone = 13
        mClone = 0
      }
      result.push({ hour: hClone, minute: mClone, second: 0 })
    }
    return result
  }

  setTime = (t: NgbTimeStruct) => this.selectedStart.set(t)

  possibleEnd = computed(() => {
    const { hour, minute } = this.selectedStart()
    return this.genEnd(hour, minute, this.step())
  })

  selectEnd = signal<NgbTimeStruct | null>(null)

  formatTime = ({ hour, minute }: NgbTimeStruct) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  compareRemarkFn(opt1: ITime, opt2: ITime): boolean {
    return opt1 && opt2 ? String(opt1.hour) === String(opt2.hour) && String(opt1.minute) === String(opt2.minute) : opt1 === opt2;
  }
}

interface ITime { hour: number | string | undefined | null, minute: number | string | undefined | null }
