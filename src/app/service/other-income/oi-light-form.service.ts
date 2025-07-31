import { computed, inject, Injectable, signal } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { TInsertOILight, TInsertOILightState } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class OiLightFormService {

  constructor() { }

  private calendar = inject(NgbCalendar)

  private today = this.calendar.getToday()

  private todayIso = `${this.today.year}-${this.today.month}-${this.today.day}`

  private initState: TInsertOILightState = {
    eventId: 0,
    compCode: '',
    compType: 'DN',
    period: 0,
    startDate: this.today,
    endDate: this.today,
    totalAmou: 0,
    totalBranch: 0,
  }

  formData = signal<TInsertOILightState>(this.initState)

  invalid = computed(() => {
    const data = this.formData()
    return data.compCode === '' || data.totalAmou === 0 || data.totalBranch === 0 || data.eventId === 0 || data.period === 0
  })

  updateForm = <K extends keyof TInsertOILight>(k: K) => (value: TInsertOILight[K]) => this.formData.update(prev => ({ ...prev, [k]: value }))

  stepList = signal<TStepState[]>([])

  changeFlatPercent = (percent: number) => this.stepList.update(prev => [{ min: 0, rate: percent }])

  addStep = () => this.stepList.update(prev => [...prev, { min: 0, rate: 0 }])

  removeStep = (idx: number) => this.stepList.update(prev => prev.filter((_, i) => i !== idx))

  private changeStep =
    <K extends keyof TStepState>(key: K) =>
      (idx: number) =>
        (value: number) => this.stepList.update(prev => prev.map((p, i) => i === idx ? ({ ...p, [key]: value }) : p))

  changeMin = this.changeStep('min')
  changeRate = this.changeStep('rate')

  get stepReq() {
    const stepName = ''
    const steps = this.stepList().map(({ min, rate }, i, arr) => {
      const nextValue = arr[i + 1]
      return { min, rate, max: nextValue ?? null }
    })
    return {
      stepName,
      steps
    }
  }
}

type TStepState = {
  min: number
  rate: number
}
