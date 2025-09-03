import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { TEvent } from './event.service';
import { TIncome } from './income.service';
import { TOIComp } from './company.service';

@Injectable({
  providedIn: 'root'
})
export class PeriodNotLightService {

  constructor() { }

  private url = environment.oi
  private api = inject(ApiService)

  params = signal<TAccountQueryReqState>({ filter: 1, compType: 1, mode: 1, eventId: 0, term: '', goodCode: '', compCode: '' })
  private params2$ = toObservable(this.params).pipe(
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
  private data$ = this.params2$.pipe(switchMap(({ compType, ...res }) => this.getMany(compType, { ...res })))


  term = signal("")
  private term$ = toObservable(this.term).pipe(
    distinctUntilChanged(),
    // debounceTime(300),
  )
  comp = signal(1)
  private comp$ = toObservable(this.comp).pipe(filter(c => [1, 2].includes(c)))
  mode = signal(1)
  private mode$ = toObservable(this.mode).pipe(filter(m => [1, 2, 3].includes(m)))
  filter = signal(1)
  private filter$ = toObservable(this.filter).pipe(filter(f => [1, 2, 3, 4].includes(f)))
  event = signal(0)
  private event$ = toObservable(this.event)
  // private query$: Observable<TQueryReq> = combineLatest([this.filter$, this.mode$, this.term$, this.event$])
  //   .pipe(
  //     map(incoming => this.formatReq(...incoming)),
  //     filter(({ eventId }) => !!eventId)
  //   )
  // private params$ = combineLatest([this.comp$, this.query$])
  private getMany(comp: number, params: TQueryReq): Observable<TPeriodSummary[]> {
    return this.api.get<TPeriodSummary[]>(`${this.url}/period/${comp === 1 ? "DN" : "HU"}`, { params })
  }
  // private periodList$ = this.params$.pipe(
  //   switchMap(([comp, queury]) => this.getMany(comp, queury))
  // )
  periods = toSignal(this.data$, { initialValue: [] })
  modInvPeriod = computed(() => this.periods().flatMap(({ receDate, invDate, income, ...res }) => {
    const hasInv = invDate !== null
    const hasRece = receDate !== null
    const status = this.mapStatus(hasInv, hasRece)
    if (this.isProduct(income.incomeType)) return []
    return [{ ...res, income, receDate, invDate, status }]
  }))
  modProPeriod = computed(() => this.periods().flatMap(({ receDate, invDate, income, ...res }) => {
    const hasInv = invDate !== null
    const hasRece = receDate !== null
    const status = this.mapStatus(hasInv, hasRece)
    if (this.isProduct(income.incomeType)) return [{ ...res, income, receDate, invDate, status }]
    return []
  }))

  private isProduct = (incomeType: number) => [1, 2].includes(incomeType)

  private mapStatus(hasInv: boolean, hasRece: boolean) {
    if (!hasInv) return 'รอเพิ่มใบแจ้งหนี้'
    if (!hasRece) return 'รอเพิ่มใบเสร็จ'
    return 'สำเร็จ'
  }

  // private formatReq = (filter: number, mode: number, term: string, event: number): TQueryReq => {
  //   console.log(mode)
  //   console.log(filter)
  //   console.log(term)
  //   if (mode === 3) {
  //     if (event === 0) {
  //       return { filter, mode }
  //     }
  //     return { filter, mode, eventId: event }
  //   }
  //   if (term === '') {
  //     return { filter, mode }
  //   }
  //   if (mode === 1) {
  //     return { filter, mode, compCode: term }
  //   }
  //   if (mode === 2) {
  //     return { filter, mode, goodCode: term }
  //   }
  //   return { filter, mode }
  // }
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