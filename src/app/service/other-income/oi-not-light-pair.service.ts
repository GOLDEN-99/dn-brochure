import { computed, inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export type TPairItem = {
  id: number
  displayName: string
  createdAt: string
  dnHeadId: number | null
  dnCompCode: string | null
  huHeadId: number | null
  huCompCode: string | null
}

@Injectable({
  providedIn: 'root'
})
export class OiNotLightPairService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi


  private readonly fetch$ = new BehaviorSubject(1)

  refetch() {
    this.fetch$.next(1)
  }

  private readonly pairList$ = this.fetch$.pipe(
    switchMap(() => this.getAll().pipe(catchError(() => of([] satisfies TPairItem[]))))
  )

  pairList = toSignal(this.pairList$, { initialValue: [] })

  getAll() {
    return this.api.get<TPairItem[]>(`${this.url}/other-income/pair`)
  }


  create(displayName: string) {
    return this.api.post<{ id: number }>(`${this.url}/other-income/pair`, { displayName })
  }

  delete(pairId: number) {
    return this.api.delete(`${this.url}/other-income/pair/${pairId}`)
  }

  availableDNPair = computed(() => this.pairList().filter(({ dnHeadId }) => !dnHeadId))

  availableHUPair = computed(() => this.pairList().filter(({ huHeadId }) => !huHeadId))

}
