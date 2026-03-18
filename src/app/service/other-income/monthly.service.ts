import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TCompType, TOIStepItem } from '../../types';
import { BehaviorSubject, combineLatest, map, of, Subject, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class MonthlyService {
  private readonly url = environment.oi
  private readonly api = inject(ApiService)
  private readonly cal = inject(NgbCalendar)
  private readonly today = this.cal.getToday()
  constructor() { }
  private readonly id$ = new BehaviorSubject<number | null>(null)
  date = signal({ year: this.today.year, month: this.today.month, day: this.today.day })
  updateDate = (key: keyof NgbDateStruct) => (value: number) => this.date.update(prev => ({ ...prev, [key]: value }))
  private readonly date$ = toObservable(this.date)
  private readonly convertDate$ = this.date$.pipe(
    map(({ month, year }) => {
      return `${year}-${String(month).padStart(2, '0')}-01`
    })
  )
  private readonly comp$ = new Subject<TCompType>()
  private readonly param$ = combineLatest([this.id$, this.convertDate$, this.comp$])

  getMonthlyIncome({ id, month, comp }: TMonthlyReq) {
    if (id === null) return of([])
    return this.api.get<TMonthlyIncomeItem2[]>(
      `${this.url}/monthly-income/income-list/${id}`,
      { params: { month, comp } }
    )
  }
  calIncome(comp: TCompType, id: number) {
    this.comp$.next(comp)
    this.id$.next(id)
  }
  private readonly incomeList$ = this.param$
    .pipe(
      switchMap(([id, month, comp]) => this.getMonthlyIncome({ id, month, comp }))
    )
  incomeList = toSignal(this.incomeList$, { initialValue: [] })

  insertNlMonth(headId: number, req: TInsertReq) {
    return this.api.post<any>(`${this.url}/monthly-income/${headId}/add-income`, req)
  }

  insertWithPeriod(headId: number, req: TInsertWithPeriodReq) {
    return this.api.post<{ monthlyId: number; periodId: number }>(
      `${this.url}/monthly-income/${headId}/add-income-with-period`,
      req
    )
  }

  insertLMonth(headId: number, createDate: string) {
    return this.api.post<any>(`${this.url}/monthly-income/${headId}/add-light-income`, { createDate })
  }

  insertBranch(lightId: number, branchCode: string, openDate: string, periodId: number) {
    return this.api.post<any>(`${this.url}/monthly-income/${lightId}/add-branch`, { branchCode, openDate, periodId })
  }

  deleteBranch(branchId: number) {
    return this.api.delete(`${this.url}/monthly-income/branch/${branchId}`)
  }

  deleteMonthly(monthId: number) {
    return this.api.delete(`${this.url}/monthly-income/income-item/${monthId}`)
  }

  calStep = (isStep: boolean, steps: TOIStepItem[], initial?: 0) => (value: number) => {
    const factor = isStep ? 1 : 0
    const raw = steps.reduce((acc, { min, max, rate }) => {
      if (value < min) return acc
      const base = min * factor
      if (!max) {
        const thisValue = (value - base) * rate
        return acc + thisValue
      }
      if (value >= max) {
        const range = (max - min)
        const thisValue = range * rate * factor
        return acc + thisValue
      }
      const discountValue = value - base
      const thisValue = discountValue * rate
      return acc + thisValue
    }, 0)
    const toPercent = raw / 100
    return toPercent
  }

  cleanup() {
    this.id$.next(null);
    const { year, month, day } = this.today
    this.date.set({ year, month, day })
  }
}

type TDiscFactor = {
  dc: number
  rebate: number,
  ince: number,
  comp: number,
  vat: number
}


type TMonthlyReq = {
  id: number | null
  month: string
  comp: TCompType
}

type TMonthlyIncomeItem = {
  totalCost: number
  totalVat: number
  rebateDisc: number
  dcDisc: number
  inceDisc: number
  compDisc: number
  subtotal: number
}

type TMonthlyIncomeItem2 = {
  receNumb: string
  calAmount: number
  billNumb: string
}

type TAppIncomeItem = {
  actualAmount: number
} & TMonthlyIncomeItem2

type TPurchaseReceItem = {
  calAmount: number
  receNumb: string
}

type TInsertReq = {
  eventType: number
  calAmount: number
  actualAmount: number
  startDate: string
  reason: string
  incomeAmount: number
  cn: number
  receList: TPurchaseReceItem[]
  endDate?: string
}

type TInsertWithPeriodReq = {
  eventType: number
  cn: number
  calAmount: number
  actualAmount: number
  incomeAmount: number
  reason: string
  startDate: string
  endDate: string
  periodName: string
  periodRemark: string
  totalAmount: number
  totalIncome: number

}
