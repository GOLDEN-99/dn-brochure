import { computed, inject, Injectable, signal } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class OtherIncomeFormService {

  constructor() { }

  compCode = signal("")
  compName = signal("")
  selectComp({ compCode, compName }: TComp) {
    this.productList.update(() => [])
    this.compCode.update(() => compCode)
    this.compName.update(() => compName)
  }
  notSelectComp = computed(() => this.compCode() === '' || this.compName() === '')


  incVat = signal<boolean>(false)

  discount = signal(false)
  discountType = signal(0)
  changeDiscount(value: boolean) {
    this.discount.update(() => value)
    this.discountType.update(() => 0)
  }
  invalidDiscount = computed(() => this.discount() && this.discountType() !== 0)

  target = signal(0)
  percent = signal(0)
  invalidPercentTarget = computed(() => this.target() === 1 && this.percent() === 0)
  needStep = computed(() => { const currentTarget = this.target(); return currentTarget === 2 || currentTarget === 3; })
  changeTarget(value: number) {
    const currentTarget = this.target()
    if (currentTarget === 1) {
      this.percent.update(() => 0)
    }
    if (currentTarget === 2 || currentTarget === 3) {
      if (value !== 2 && value !== 3) {
        this.step.update(() => [])
      }
    }
    this.target.update(() => value)
  }


  period = signal(0)

  limit = signal(false)
  limitAmount = signal(0)
  changeLimit(value: boolean) {
    this.limit.update(() => value)
    this.limitAmount.update(() => 0)
  }
  invalidLimitAmount = computed(() => this.limit() && this.limitAmount() === 0)

  calendar = inject(NgbCalendar);
  fromDate = signal(this.calendar.getToday())
  toDate = signal(this.calendar.getToday())

  step = signal<TStepItem[]>([{ start: 0, percent: 0 }])
  private changeStepItem = <K extends keyof TStepItem>(k: K) => (idx: number) => (value: TStepItem[K]) => {
    this.step.update((prev) => prev.map((p, i) => i === idx ? ({ ...p, [k]: Number(value) }) : p))
  }
  changeStart = this.changeStepItem('start')
  changePercent = this.changeStepItem('percent')
  deleteStep = (idx: number) => this.step.update(p => p.filter((_, i) => i !== idx))
  addStep = () => {
    this.step.update(p => [...p, { start: 0, percent: 0 }])
  }
  productList = signal<TProduct[]>([])
}

type TStepItem = {
  start: number
  percent: number
}
type TProduct = { name: string, check: boolean, id: number }
type TComp = {
  compCode: string
  compName: string
}
