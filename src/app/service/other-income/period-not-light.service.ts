import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, filter, Observable, switchMap } from 'rxjs';
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

  term = signal("")
  private term$ = toObservable(this.term).pipe(
    distinctUntilChanged(),
    debounceTime(300),
    filter(t => t !== '')
  )
  comp = signal(1)
  private comp$ = toObservable(this.comp).pipe(filter(c => [1, 2].includes(c)))
  mode = signal(1)
  private mode$ = toObservable(this.mode).pipe(filter(m => [1, 2].includes(m)))
  filter = signal(1)
  private filter$ = toObservable(this.filter).pipe(filter(f => [1, 2, 3, 4].includes(f)))
  private params = combineLatest([this.term$, this.comp$, this.filter$, this.mode$])
  private getMany(term: string, comp: number, filter: number, mode: number): Observable<TPeriodSummary[]> {
    return this.api.get<TPeriodSummary[]>(`${this.url}/period/${comp === 1 ? "DN" : "HU"}`, { params: { term, filter, mode } })
  }
  private periodList$ = this.params.pipe(
    switchMap(([term, comp, filter, mode]) => this.getMany(term, comp, filter, mode))
  )
  periods = toSignal(this.periodList$, { initialValue: [] })
  modInvPeriod = computed(() => this.periods().flatMap(({ receDate, invDate, income, ...res }) => {
    const hasInv = invDate !== null
    const hasRece = receDate !== null
    const status = this.mapStatus(hasInv, hasRece)
    if (income.isProduct) return []
    return [{ ...res, income, receDate, invDate, status }]
  }))
  modProPeriod = computed(() => this.periods().flatMap(({ receDate, invDate, income, ...res }) => {
    const hasInv = invDate !== null
    const hasRece = receDate !== null
    const status = this.mapStatus(hasInv, hasRece)
    if (income.isProduct) return [{ ...res, income, receDate, invDate, status }]
    return []
  }))

  private mapStatus(hasInv: boolean, hasRece: boolean) {
    if (!hasInv) return 'รอเพิ่มใบแจ้งหนี้'
    if (!hasRece) return 'รอเพิ่มใบเสร็จ'
    return 'สำเร็จ'
  }
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
