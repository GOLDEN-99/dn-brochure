import { computed, inject, Injectable, signal } from '@angular/core';
import { ManyContactLightResponse } from './base-oi';
import { catchError, combineLatest, debounceTime, of, shareReplay, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OiLightListService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  private getAll({ compType, query }: { compType: string, query: {} }) {
    return this.api.get<ManyContactLightResponse[]>(`${this.url}/other-income/contact/light/${compType}`, { params: query })
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

  private readonly lightList$ = combineLatest([toObservable(this.term), toObservable(this.queryKey), toObservable(this.compType), toObservable(this.refresh)]).pipe(
    debounceTime(400),
    switchMap(([term, queryKey, compType]) => this.getAll({ compType, query: { [queryKey]: term } })),
    shareReplay(1),
  )
  lightList = toSignal(this.lightList$, { initialValue: [] })

}
