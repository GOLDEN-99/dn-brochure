import { inject, Injectable, OnInit, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TCompType, TOIStepItem } from '../../types';
import { BehaviorSubject, catchError, combineLatest, map, Subject, switchMap, tap, throwError } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class MonthlyService {
  private url = environment.oi
  private api = inject(ApiService)
  private cal = inject(NgbCalendar)
  private today = this.cal.getToday()
  constructor() { }
  private id$ = new Subject<number>()
  date = signal({ year: this.today.year, month: this.today.month, day: this.today.day })
  updateDate = (key: keyof NgbDateStruct) => (value: number) => this.date.update(prev => ({ ...prev, [key]: value }))
  private date$ = toObservable(this.date)
  private convertDate$ = this.date$.pipe(
    map(({ month, year }) => {
      return `${year}-${String(month).padStart(2, '0')}-01`
    })
  )
  private comp$ = new Subject<TCompType>()
  private param$ = combineLatest([this.id$, this.convertDate$, this.comp$])

  getMonthlyIncome({ id, month, comp }: TMonthlyReq) {
    return this.api.get<TMonthlyIncomeItem2[]>(
      `${this.url}/monthly-income/income-list/${id}`,
      { params: { month, comp } }
    )
  }
  calIncome(comp: TCompType, id: number) {
    this.comp$.next(comp)
    this.id$.next(id)
  }
  private incomeList$ = this.param$
    .pipe(
      switchMap(([id, month, comp]) => this.getMonthlyIncome({ id, month, comp }))
    )
  incomeList = toSignal(this.incomeList$, { initialValue: [] })

  insertNlMonth(headId: number, req: TInsertReq) {
    return this.api.post<any>(`${this.url}/monthly-income/${headId}/add-income`, req)
  }

  insertLMonth(headId: number, createDate: string) {
    return this.api.post<any>(`${this.url}/monthly-income/${headId}/add-light-income`, { createDate })
  }

  insertBranch(lightId: number, branchCode: string, openDate: string) {
    return this.api.post<any>(`${this.url}/monthly-income/${lightId}/add-branch`, { branchCode, openDate })
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
}

type TDiscFactor = {
  dc: number
  rebate: number,
  ince: number,
  comp: number,
  vat: number
}


type TMonthlyReq = {
  id: number
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
