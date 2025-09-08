import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { TEvent } from './event.service';
import { TOIComp } from './company.service';
import { TAccountQueryReqState } from './period-not-light.service';

@Injectable({
  providedIn: 'root'
})
export class PeriodLightService {

  constructor() { }

  private url = environment.oi
  private api = inject(ApiService)
  params = signal<TAccountQueryReqState>({ filter: 1, compType: 1, mode: 1, eventId: 0, term: '', goodCode: '', compCode: '' })
  private params2$ = toObservable(this.params).pipe(
    filter(({ goodCode, compCode, eventId, mode }) => {
      switch (mode) {
        case 1: return compCode !== ''
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

  private getMany(comp: number, params: TQueryReq): Observable<TPeriodSummaryLight[]> {
    return this.api.get<TPeriodSummaryLight[]>(`${this.url}/period/${comp === 1 ? "DN" : "HU"}`, { params: { ...params, isLight: 2, incomeType: 3 } })
  }
  private periodList$ = this.params2$.pipe(
    switchMap(({ compType, ...res }) => this.getMany(compType, { ...res }))
  )
  periods = toSignal(this.periodList$, { initialValue: [] })
  modPeriod = computed(() => this.periods().map(({ receDate, invDate, ...res }) => {
    const hasInv = invDate !== null
    const hasRece = receDate !== null
    const status = this.mapStatus(hasInv, hasRece)
    return { ...res, receDate, invDate, status }
  }))

  private mapStatus(hasInv: boolean, hasRece: boolean) {
    if (!hasInv) return 'รอเพิ่มใบแจ้งหนี้'
    if (!hasRece) return 'รอเพิ่มใบเสร็จ'
    return 'สำเร็จ'
  }
}

type TPeriodSummaryLight = {
  id: number
  displayName: string
  periodId: number
  periodName: string
  remark: string
  event: TEvent
  company: TOIComp
  startDate: string
  endDate: string
  invDate: string | null
  receDate: string | null
}

type TQueryReq = {
  filter: number
  eventId?: number
  compCode?: string
  goodCode?: string
}
