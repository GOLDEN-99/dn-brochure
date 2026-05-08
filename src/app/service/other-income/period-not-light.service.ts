import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { TEvent } from './event.service';
import { TIncome } from './income.service';
import { TOIComp } from './company.service';
import { PeriodStatus } from '../../types/other-income';

@Injectable({
  providedIn: 'root'
})
export class PeriodNotLightService {

  private readonly url = environment.oi
  private readonly api = inject(ApiService)

  params = signal<TAccountQueryReqState>({ filter: 0, compType: 1, mode: 1, eventId: 0, term: '', goodCode: '', compCode: '' })
  private readonly refresh = signal(0)
  refetch() { this.refresh.update(n => n + 1) }

  private readonly params$ = toObservable(this.params).pipe(
    filter(({ goodCode, eventId, mode }) => {
      switch (mode) {
        case 1: return true
        case 2: return goodCode !== ''
        case 3: return eventId !== 0
        default: return false
      }
    }),
    distinctUntilChanged((q1, q2) => {
      if (!q1 || !q2) return false
      if (q1.compType !== q2.compType || q1.mode !== q2.mode || q1.filter !== q2.filter) return false
      if (q2.mode === 1) return q1.compCode === q2.compCode
      if (q2.mode === 2) return q1.goodCode === q2.goodCode
      if (q2.mode === 3) return q1.eventId === q2.eventId
      return true
    }),
    debounceTime(300),
    map(({ mode, filter, eventId, compType, compCode, goodCode }) => {
      switch (mode) {
        case 1: return { compType, filter, compCode }
        case 2: return { compType, filter, goodCode }
        case 3: return { compType, filter, eventId }
        default: return { compType, filter: 3 }
      }
    })
  )
  private readonly data$ = combineLatest([this.params$, toObservable(this.refresh)]).pipe(
    switchMap(([{ compType, ...res }]) => this.getMany(compType, { ...res }))
  )


  private getMany(comp: number, params: TQueryReq): Observable<TPeriodSummary[]> {
    return this.api.get<TPeriodSummary[]>(`${this.url}/period/${comp === 1 ? "DN" : "HU"}`, { params: { ...params, incomeType: 3, isLight: 1 } })
  }

  periods = toSignal(this.data$, { initialValue: [] })
  modPeriod = computed(() => this.periods())

}

type TPeriodSummary = {
  id: number
  displayName: string
  cn: string
  periodId: number
  remark: string
  event: TEvent
  income: TIncome
  company: TOIComp
  startDate: string
  endDate: string
  invDate: string | null
  receDate: string | null
  periodName: string
  invAmount: number
  receAmount: number
  periodStatus?: PeriodStatus | null
}

type TQueryReq = {
  filter: number
  eventId?: number
  compCode?: string
  goodCode?: string
}

export type TAccountQueryReqState = {
  compType: number
  term: string
  eventId: number
  mode: number
  filter: number
  compCode: string
  goodCode: string
}