import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotLightSingle, TContactHead, TExtendedIncomeItem, TPopulatedPeriodResult } from './base-oi';
import { TCompType } from '../../types';
import { TOIComp } from './company.service';


export type TPairDetail = {
  id: number
  displayName: string
  dn: NotLightSingle[]
  hu: NotLightSingle[]
}

@Injectable({
  providedIn: 'root'
})
export class OiNotLightDualService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  getDetail(pairId: number) {
    return this.api.get<TPairDetail>(`${this.url}/other-income/pair/${pairId}/detail`)
  }

  private readonly fetch$ = new BehaviorSubject<number | null>(null)

  fetchById(pairId: number) {
    this.fetch$.next(pairId)
  }

  refetch() {
    const id = this.fetch$.getValue()
    if (id !== null) this.fetch$.next(id)
  }

  private readonly selectIncome = (compType: TCompType) => (record: NotLightSingle): TExtendedIncomeItem[] => {
    const { incomeList } = record
    return incomeList.map(i => ({ ...i, compType }) satisfies TExtendedIncomeItem)
  }

  private readonly selectDNIncome = this.selectIncome("DN")
  private readonly selectHUIncome = this.selectIncome("HU")

  mergeList = computed(() => {
    const detail = this.detail()
    if (!detail) return []
    const { dn, hu } = detail
    return [...this.selectDNIncome(dn[0]), ...this.selectHUIncome(hu[0])].sort((a, b) => a.id - b.id);
  })

  dnSummary = computed(() => {
    const dnList = this.detail()?.dn[0].incomeList ?? []
    return dnList.reduce(({ accAmount, accInc, accCal }, { actualAmount, calAmount, incomeAmount }) => {
      return { accAmount: accAmount + actualAmount, accInc: accInc + incomeAmount, accCal: calAmount + accCal }
    }, { accAmount: 0, accInc: 0, accCal: 0 })
  })

  huSummary = computed(() => {
    const huList = this.detail()?.hu[0].incomeList ?? []
    return huList.reduce(({ accAmount, accInc, accCal }, { actualAmount, calAmount, incomeAmount }) => {
      return { accAmount: accAmount + actualAmount, accInc: accInc + incomeAmount, accCal: calAmount + accCal }
    }, { accAmount: 0, accInc: 0, accCal: 0 })
  })

  summary = computed(() => {
    const dn = this.dnSummary()
    const hu = this.huSummary()
    return {
      accAmount: dn.accAmount + hu.accAmount,
      accCal: dn.accCal + hu.accCal,
      accInc: dn.accInc + hu.accInc
    }
  })

  private readonly detail$ = this.fetch$.pipe(
    switchMap(id => id === null
      ? of(null)
      : this.getDetail(id).pipe(catchError(() => of(null)))
    )
  )

  detail = toSignal(this.detail$, { initialValue: null as TPairDetail | null })
}
