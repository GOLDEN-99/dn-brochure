import { inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { TCreatePromotionRequest, TPromotionDetail, TPromotionListItem } from '../../types/crm-promotion.type';

@Injectable({
  providedIn: 'root',
})
export class CrmPromotionService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi + '/crm'

  private readonly refetchListSig = signal(0)
  private readonly refetchList$ = toObservable(this.refetchListSig)
  private readonly allPromotions$ = this.refetchList$.pipe(
    switchMap(() => this.api.get<TPromotionListItem[]>(`${this.url}/promotions`))
  )
  allPromotions = toSignal(this.allPromotions$, { initialValue: [] })

  refetchPromotions() { this.refetchListSig.update(v => v + 1) }

  createPromotion(req: TCreatePromotionRequest): Observable<{ id: number }> {
    return this.api.post(`${this.url}/promotions`, req)
  }

  getPromotionById(id: number): Observable<TPromotionDetail> {
    return this.api.get(`${this.url}/promotions/${id}`)
  }

  togglePromotionStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<void> {
    return this.api.patch(`${this.url}/promotions/${id}/status`, { status })
  }
}
