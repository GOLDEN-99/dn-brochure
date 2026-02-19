import { computed, inject, Injectable, signal } from '@angular/core';
import { ManyContactResponse } from './base-oi';
import { catchError, combineLatest, debounceTime, of, shareReplay, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OiNotLightListService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  private getAll({ compType, query }: { compType: string, query: {} }) {
    return this.api.get<ManyContactResponse[]>(`${this.url}/other-income/contact/not-light/${compType}`, { params: query })
      .pipe(catchError(() => of([])))
  }

  readonly term = signal('')
  readonly mode = signal(1)
  readonly queryKey = computed(() => {
    const mode = this.mode()
    switch (mode) {
      case 1: return 'compCode' as const
      case 2: return 'compName' as const
      case 3: return 'goodCode' as const
      default: return 'compCode' as const
    }
  })
  readonly compType = signal<'DN' | 'HU'>('DN')

  private readonly refresh = signal(0)
  refetch() { this.refresh.update(n => n + 1) }

  private readonly notLight$ = combineLatest([toObservable(this.term), toObservable(this.queryKey), toObservable(this.compType), toObservable(this.refresh)]).pipe(
    debounceTime(400),
    switchMap(([term, queryKey, compType]) => this.getAll({ compType, query: { [queryKey]: term } })),
    shareReplay(1),
  )
  private readonly rawList = toSignal(this.notLight$, { initialValue: [] })

  private readonly calendar = inject(NgbCalendar)
  readonly filterStatus = signal(false)
  private readonly filterByMonth = ({ year, month }: NgbDate) => (d: ManyContactResponse) => {
    if (d.lastAdded === null) return [d]
    const [yyyy, mm] = d.lastAdded.split('T')[0].split('-').map(Number)
    if (yyyy === year && mm === month) return []
    return [d]
  }
  notLightList = computed(() => {
    const data = this.rawList()
    if (!this.filterStatus()) return data
    return data.flatMap(this.filterByMonth(this.calendar.getToday()))
  })

}
