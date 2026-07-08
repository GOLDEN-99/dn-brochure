import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import {
  TSettlementOverviewItem,
  TInvoiceStateRow,
  TSettlementDetail,
} from '../../shared/types/other-income.type';

/**
 * HttpParams.fromObject stringifies every key present, including `undefined`
 * (→ literal `"undefined"` in the query string) — it does not drop them. Omit
 * undefined entries here so optional filters are absent from the request
 * instead of sent as the string "undefined".
 */
function compact<T extends Record<string, unknown>>(params: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in params) {
    if (params[key] !== undefined) result[key] = params[key]
  }
  return result
}

@Injectable({
  providedIn: 'root',
})
export class OtherIncomeAccountApiService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  getSettlementsOverview(params?: {
    contractType?: 'ORDER' | 'BRANCH' | 'PROMO'
    contractId?: number
    balanceState?: 'OUTSTANDING' | 'SETTLED'
    reviewState?: 'UNREVIEWED' | 'REVIEWED'
    incomeType?: 'Bill' | 'FreeItem' | 'Invoice' | 'CreditNote' | 'all'
    compType?: 'DN' | 'HU'
  }): Observable<TSettlementOverviewItem[]> {
    return this.api.get(`${this.url}/v2/settlements/overview`, { params: compact(params ?? {}) })
  }

  getInvoiceStates(params?: {
    invoiceState?: 'UNMATCHED' | 'MATCHED'
    contractType?: 'ORDER' | 'BRANCH' | 'PROMO'
    contractId?: number
  }): Observable<TInvoiceStateRow[]> {
    return this.api.get(`${this.url}/v2/settlements/invoice-states`, { params: compact(params ?? {}) })
  }

  getSettlementDetail(id: number): Observable<TSettlementDetail> {
    return this.api.get(`${this.url}/v2/settlements/${id}`)
  }
}
