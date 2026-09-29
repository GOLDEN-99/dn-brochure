import { inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { TCreatePromotionRequest, TPromotionDetail, TPromotionListItem } from '../../types/crm-promotion.type';
import {
  TCreateItemPriceRequest,
  TItemPriceRequestDetail,
  TItemPriceRequestSummary,
  TResolveRequest,
  TResolveResponse,
} from '../../pages/crm-promotion/create/item-price-import/item-price-import.types';

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

  updatePromotion(id: number, req: TCreatePromotionRequest): Observable<{ message: string }> {
    return this.api.put<{ message: string }>(`${this.url}/promotions/${id}`, req)
  }

  togglePromotionStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<void> {
    return this.api.patch(`${this.url}/promotions/${id}/status`, { status })
  }

  // ── Item-price import (docs/crm-item-price-import-api-spec.md) ──────────

  /** Stateless validation view: ladder, qualifying levels, overlaps per line. */
  resolveItemPrice(req: TResolveRequest): Observable<TResolveResponse> {
    return this.api.post<TResolveResponse>(`${this.url}/item-price-requests/resolve`, req)
  }

  /** Stores the request and starts issuing; 202 with the new id. */
  createItemPriceRequest(req: TCreateItemPriceRequest): Observable<{ id: number }> {
    return this.api.post<{ id: number }>(`${this.url}/item-price-requests`, req)
  }

  getItemPriceRequest(id: number): Observable<TItemPriceRequestDetail> {
    return this.api.get<TItemPriceRequestDetail>(`${this.url}/item-price-requests/${id}`)
  }

  /** Newest first, as returned by the API. */
  listItemPriceRequests(): Observable<TItemPriceRequestSummary[]> {
    return this.api.get<TItemPriceRequestSummary[]>(`${this.url}/item-price-requests`)
  }

  /** Allowed only on FAILED; re-queues lines without a promotionId. */
  retryItemPriceRequest(id: number): Observable<{ id: number }> {
    return this.api.post<{ id: number }>(`${this.url}/item-price-requests/${id}/retry`, {})
  }
}
