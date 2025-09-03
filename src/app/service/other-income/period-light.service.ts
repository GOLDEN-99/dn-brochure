import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, Observable, switchMap } from 'rxjs';
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
  params2 = signal<TAccountQueryReqState>({ filter: 3, compType: 1, mode: 1, eventId: 0, term: '', goodCode: '', compCode: '' })

  term = signal("")
  private term$ = toObservable(this.term).pipe(filter(t => t !== ''))
  comp = signal(1)
  private comp$ = toObservable(this.comp).pipe(filter(c => [1, 2].includes(c)))
  filter = signal(1)
  private filter$ = toObservable(this.filter).pipe(filter(f => [1, 2, 3, 4].includes(f)))
  private params = combineLatest([this.term$, this.comp$, this.filter$])
  private getMany(term: string, comp: number, filter: number): Observable<TPeriodSummaryLight[]> {
    return this.api.get<TPeriodSummaryLight[]>(`${this.url}/period/light`, { params: { term, comp, filter } })
  }
  private periodList$ = this.params.pipe(
    switchMap(([term, comp, filter]) => this.getMany(term, comp, filter))
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
  totalBranch: number,
  totalAmount: number,
  periodId: number
  remark: string
  event: TEvent
  company: TOIComp
  startDate: string
  endDate: string
  invDate: string | null
  receDate: string | null
}