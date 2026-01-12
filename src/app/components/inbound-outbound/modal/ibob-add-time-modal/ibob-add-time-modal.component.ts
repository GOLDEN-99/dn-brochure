import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { TimeslotRowComponent } from '../../timeslot-row/timeslot-row.component';
import { TDuration } from '../../../../service/ibob/baseDoorForm';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ibob-add-time-modal',
  imports: [TimeslotRowComponent],
  templateUrl: './ibob-add-time-modal.component.html',
  styleUrl: './ibob-add-time-modal.component.scss'
})
export class IbobAddTimeModalComponent implements OnInit {
  ngOnInit(): void {
    const to = this.last()
    const nextForm = to
    const { hour, minute } = to
    const validNextFormHour = hour !== 12 ? hour : 13
    const validNextForm = { hour: validNextFormHour, minute, second: 0 }
    const nextHour = nextForm.hour < 12 ? 12 : 17
    const nextTo = { hour: nextHour, minute: nextHour !== 17 ? 0 : 30, second: 0 }
    this.state.update(prev => ({ form: validNextForm, to: nextTo }))
  }

  last = input.required<NgbTimeStruct>()
  lastMin = computed(() => { const { hour, minute } = this.last(); return (hour * 60) + minute })
  close = output<void>()
  submit = output<TDuration>()
  day = input<string>('วันทดสอบ')
  header = computed(() => `เพิ่มเวลาวัน ${this.day()}`)
  onSubmit() {
    if (this.invalid()) return
    this.submit.emit(this.state())
  }
  state = signal<TDuration>({
    form: {
      hour: 0,
      minute: 0,
      second: 0
    },
    to: {
      hour: 0,
      minute: 0,
      second: 0
    }
  })
  private moLo = (8 * 60)
  private moHi = 12 * 60
  private afLo = 13 * 60
  private afHi = (18 * 60)
  private invalidTime = (t: NgbTimeStruct) => {
    const { hour, minute, second } = t
    const invalidHour = hour < 0 && hour > 23
    const invalidMinute = minute < 0 && minute > 59
    // const invalidSecond = second < 0 && second > 59
    return invalidHour || invalidMinute
  }
  private inMoring = (min: number) => min >= this.moLo && min <= this.moHi
  private inAf = (min: number) => min >= this.afLo && min <= this.afHi

  invalidForm = computed(() => this.invalidTime(this.state().form))
  invalidTo = computed(() => this.invalidTime(this.state().to))
  invalidRange = computed(() => {
    const { form, to } = this.state()
    const f = form.hour * 60 + form.minute
    const t = to.hour * 60 + to.minute
    const validMo = this.inMoring(f) && this.inMoring(t)
    const validAf = this.inAf(f) && this.inAf(t)
    return (!validAf && !validMo) || f >= t || f < this.lastMin()
  })


  invalid = computed(() => this.invalidForm() || this.invalidTo() || this.invalidRange())
  onChange(t: TDuration) {
    this.state.update(prev => ({ ...prev, ...t }))
  }


}
