import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import {
  TSettlementOverviewItem,
  TInvoiceStateRow,
  TSettlementDetail,
  TAccrualOrderReportRow,
  TAccrualBranchReportRow,
  TAccrualPromoReportRow,
  TAccrualReportParams,
  TBillDiscountStateRow,
  TFreeItemStateRow,
  TCheckStateParams,
  TSettlementReportRow,
  TSettlementReportParams,
  TContributingProductRow,
  TContributingProductParams,
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
    compType?: 'DN' | 'HU'
  }): Observable<TInvoiceStateRow[]> {
    return this.api.get(`${this.url}/v2/settlements/invoice-states`, { params: compact(params ?? {}) })
  }

  getSettlementDetail(id: number): Observable<TSettlementDetail> {
    return this.api.get(`${this.url}/v2/settlements/${id}`)
  }

  getAccrualOrderReport(params?: TAccrualReportParams): Observable<TAccrualOrderReportRow[]> {
    return this.api.get(`${this.url}/v2/report/accrual/order`, { params: compact(params ?? {}) })
  }

  getAccrualBranchReport(params?: TAccrualReportParams): Observable<TAccrualBranchReportRow[]> {
    return this.api.get(`${this.url}/v2/report/accrual/branch`, { params: compact(params ?? {}) })
  }

  getAccrualPromoReport(params?: TAccrualReportParams): Observable<TAccrualPromoReportRow[]> {
    return this.api.get(`${this.url}/v2/report/accrual/promo`, { params: compact(params ?? {}) })
  }

  getSettlementReport(params: TSettlementReportParams): Observable<TSettlementReportRow[]> {
    return this.api.get(`${this.url}/v2/report/settlement`, { params: compact(params) })
  }

  getContributingProducts(params: TContributingProductParams): Observable<TContributingProductRow[]> {
    return this.api.get(`${this.url}/v2/report/contributing-products`, { params: compact(params) })
  }

  getBillDiscountStates(params?: TCheckStateParams): Observable<TBillDiscountStateRow[]> {
    return this.api.get(`${this.url}/v2/settlements/bill-discount-states`, { params: compact(params ?? {}) })
  }

  checkBillDiscount(settlementId: number, itemId: number, checkedBy: string): Observable<void> {
    return this.api.post(`${this.url}/v2/settlements/${settlementId}/bill-discounts/${itemId}/check`, { checkedBy })
  }

  deleteBillDiscountState(settlementId: number, itemId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${settlementId}/bill-discounts/${itemId}`)
  }

  getFreeItemStates(params?: TCheckStateParams): Observable<TFreeItemStateRow[]> {
    return this.api.get(`${this.url}/v2/settlements/free-item-states`, { params: compact(params ?? {}) })
  }

  checkFreeItem(settlementId: number, itemId: number, checkedBy: string): Observable<void> {
    return this.api.post(`${this.url}/v2/settlements/${settlementId}/free-items/${itemId}/check`, { checkedBy })
  }

  deleteFreeItemState(settlementId: number, itemId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${settlementId}/free-items/${itemId}`)
  }
}
