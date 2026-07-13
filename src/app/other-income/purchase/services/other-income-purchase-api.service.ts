import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import {
  TOrderContractListItem,
  TOrderContractDetail,
  TCreateOrderContractReq,
  TCreatePairedOrderContractReq,
  TUpdateOrderContractHeaderReq,
  TUpdateOrderContractSpecReq,
  TIncomeEntry,
  TBranchContractListItem,
  TBranchContractDetail,
  TCreateBranchContractReq,
  TUpdateBranchContractSpecReq,
  TAddBranchReq,
  TCloseBranchReq,
  TBranchSearchResult,
  TPromoContractListItem,
  TPromoContractDetail,
  TCreatePromoContractReq,
  TUpdatePromoContractReq,
  TPostPromoAccrualReq,
  TSettlementListItem,
  TSettlementDetail,
  TPostSettlementReq,
  TPostBillDiscountReq,
  TPostFreeItemReq,
  TPostInvoiceReq,
  TPostReceiptReq,
  TPostMatchReq,
  TPostCreditNoteReq,
  TOtherIncomeMatching,
  TAccrualStateRow,
  TAccrualStateParams,
  TPostCnCorrectionReq,
  TPostLagCorrectionReq,
  TLagCorrectionRes,
  TPostManualCorrectionReq,
  TCnCorrectionItem,
  TLagCorrectionItem,
  TBillDiscountOrderLine,
  TFreeItemOrderLine,
  TBillDiscountSearchParams,
  TFreeItemSearchParams,
  TDateRange,
  TPostReceiptWithMatchesReq,
  TSupplierPair,
  TPairedIncomeEntries,
  TPostPairedSettlementReq,
  TPostPairedSettlementRes,
  TOrderConfirmationReport,
  TGetOrderConfirmationReportParams,
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
export class OtherIncomePurchaseApiService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  // ─────────────── Group A — Order contracts ───────────────

  getOrderContracts(params?: { compCode?: string; compType?: string; startDate?: string; endDate?: string }): Observable<TOrderContractListItem[]> {
    return this.api.get(`${this.url}/v2/order-contracts`, { params: compact(params ?? {}) })
  }

  getOrderContract(id: number): Observable<TOrderContractDetail> {
    return this.api.get(`${this.url}/v2/order-contracts/${id}`)
  }

  createOrderContract(req: TCreateOrderContractReq): Observable<{ id: number; accruals_posted: number }> {
    return this.api.post(`${this.url}/v2/order-contracts`, req)
  }

  createPairedOrderContract(req: TCreatePairedOrderContractReq): Observable<{ pairId: number; dnContractId: number; huContractId: number; supplierPairId: number }> {
    return this.api.post(`${this.url}/v2/order-contracts/paired`, req)
  }

  getSupplierPairs(): Observable<TSupplierPair[]> {
    return this.api.get(`${this.url}/v2/master/supplier-pairs`)
  }

  updateOrderContractHeader(id: number, req: TUpdateOrderContractHeaderReq): Observable<void> {
    return this.api.put(`${this.url}/v2/order-contracts/${id}`, req)
  }

  updateOrderContractSpec(id: number, req: TUpdateOrderContractSpecReq): Observable<void> {
    return this.api.put(`${this.url}/v2/order-contracts/${id}/spec`, req)
  }

  addOrderContractProduct(id: number, goodCode: string): Observable<{ id: number }> {
    return this.api.post(`${this.url}/v2/order-contracts/${id}/products`, { goodCode })
  }

  removeOrderContractProduct(id: number, goodCode: string): Observable<void> {
    return this.api.delete(`${this.url}/v2/order-contracts/${id}/products/${goodCode}`)
  }

  deleteOrderContract(id: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/order-contracts/${id}`)
  }

  getAccrualPreview(id: number, month: string, compType: string): Observable<unknown> {
    return this.api.get(`${this.url}/v2/order-contracts/${id}/accrual-preview`, { params: { month, compType } })
  }

  postOrderAccrual(id: number, month: string): Observable<{ id: number; amount: number }> {
    return this.api.post(`${this.url}/v2/order-contracts/${id}/accruals`, { month })
  }

  postPairedOrderAccrual(pairId: number, month: string): Observable<{ dn_accrual_id: number; dn_amount: number; hu_accrual_id: number; hu_amount: number }> {
    return this.api.post(`${this.url}/v2/order-contracts/paired/${pairId}/accruals`, { month })
  }

  postOrderSettlement(req: TPostSettlementReq): Observable<TSettlementListItem> {
    return this.api.post(`${this.url}/v2/settlements`, { ...req, invoices: [], billDiscounts: [], freeItems: [], creditNotes: [] })
  }

  getPairedIncomeEntries(params: { dnContractId?: number; huContractId?: number }): Observable<TPairedIncomeEntries> {
    return this.api.get(`${this.url}/v2/income-entries/paired`, { params: compact(params) })
  }

  postPairedSettlement(req: TPostPairedSettlementReq): Observable<TPostPairedSettlementRes> {
    return this.api.post(`${this.url}/v2/settlements/paired`, req)
  }

  postCnCorrection(contractId: number, req: TPostCnCorrectionReq): Observable<TIncomeEntry> {
    return this.api.post(`${this.url}/v2/income-entries/order/${contractId}/cn-correction`, req)
  }

  getCnItems(entryId: number): Observable<TCnCorrectionItem[]> {
    return this.api.get(`${this.url}/v2/income-entries/${entryId}/cn-items`)
  }

  postLagCorrection(contractId: number, req: TPostLagCorrectionReq): Observable<TLagCorrectionRes> {
    return this.api.post(`${this.url}/v2/income-entries/order/${contractId}/lag-correction`, req)
  }

  getLagItems(entryId: number): Observable<TLagCorrectionItem[]> {
    return this.api.get(`${this.url}/v2/income-entries/${entryId}/lag-items`)
  }

  postManualCorrection(req: TPostManualCorrectionReq): Observable<TIncomeEntry> {
    return this.api.post(`${this.url}/v2/income-entries/correction`, req)
  }

  deleteIncomeEntry(id: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/income-entries/${id}`)
  }

  // ─────────────── Group B — Branch contracts ───────────────

  getBranchContracts(params?: { compCode?: string; compType?: string; startDate?: string; endDate?: string }): Observable<TBranchContractListItem[]> {
    return this.api.get(`${this.url}/v2/branch-contracts`, { params: compact(params ?? {}) })
  }

  getBranchContract(id: number): Observable<TBranchContractDetail> {
    return this.api.get(`${this.url}/v2/branch-contracts/${id}`)
  }

  createBranchContract(req: TCreateBranchContractReq): Observable<{ id: number }> {
    return this.api.post(`${this.url}/v2/branch-contracts`, req)
  }

  updateBranchContractHeader(id: number, req: Partial<TCreateBranchContractReq>): Observable<void> {
    return this.api.put(`${this.url}/v2/branch-contracts/${id}`, req)
  }

  updateBranchContractSpec(id: number, req: TUpdateBranchContractSpecReq): Observable<void> {
    return this.api.put(`${this.url}/v2/branch-contracts/${id}/spec`, req)
  }

  deleteBranchContract(id: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/branch-contracts/${id}`)
  }

  addBranch(id: number, req: TAddBranchReq): Observable<{ entryId: number; accruals_posted: number }> {
    return this.api.post(`${this.url}/v2/branch-contracts/${id}/branches`, req)
  }

  searchBranches(term?: string): Observable<TBranchSearchResult[]> {
    return this.api.get(`${this.url}/v2/master/branches`, { params: term ? { term } : undefined })
  }

  closeBranch(id: number, entryId: number, req: TCloseBranchReq): Observable<{ accruals_updated: number }> {
    return this.api.put(`${this.url}/v2/branch-contracts/${id}/branches/${entryId}/close`, req)
  }

  postBranchSettlement(req: TPostSettlementReq): Observable<TSettlementListItem> {
    return this.api.post(`${this.url}/v2/settlements`, { ...req, invoices: [], billDiscounts: [], freeItems: [], creditNotes: [] })
  }

  // ─────────────── Group C — Promo contracts ───────────────

  getPromoContracts(params?: { compCode?: string; compType?: string; startDate?: string; endDate?: string }): Observable<TPromoContractListItem[]> {
    return this.api.get(`${this.url}/v2/promo-contracts`, { params: compact(params ?? {}) })
  }

  getPromoContract(id: number): Observable<TPromoContractDetail> {
    return this.api.get(`${this.url}/v2/promo-contracts/${id}`)
  }

  createPromoContract(req: TCreatePromoContractReq): Observable<{ id: number }> {
    return this.api.post(`${this.url}/v2/promo-contracts`, req)
  }

  updatePromoContract(id: number, req: TUpdatePromoContractReq): Observable<void> {
    return this.api.put(`${this.url}/v2/promo-contracts/${id}`, req)
  }

  deletePromoContract(id: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/promo-contracts/${id}`)
  }

  postPromoAccrual(id: number, req: TPostPromoAccrualReq): Observable<TIncomeEntry> {
    return this.api.post(`${this.url}/v2/income-entries/promo`, { contractId: id, month: req.month, amount: req.amount })
  }

  deletePromoAccrual(accrualId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/income-entries/${accrualId}`)
  }

  postPromoSettlement(req: TPostSettlementReq): Observable<TSettlementListItem> {
    return this.api.post(`${this.url}/v2/settlements`, { ...req, invoices: [], billDiscounts: [], freeItems: [], creditNotes: [] })
  }

  // ─────────────── Group S — Shared income entries + settlements + report ───────────────

  getIncomeEntries(params: { contractType?: 'ORDER' | 'BRANCH' | 'PROMO'; contractId?: number; monthFrom?: string; monthTo?: string; state?: 'open' | 'picked' }): Observable<TIncomeEntry[]> {
    return this.api.get(`${this.url}/v2/income-entries`, { params })
  }

  getSettlements(params: { contractType?: 'ORDER' | 'BRANCH' | 'PROMO'; contractId?: number }): Observable<TSettlementListItem[]> {
    return this.api.get(`${this.url}/v2/settlements`, { params })
  }

  getSettlementDetail(id: number): Observable<TSettlementDetail> {
    return this.api.get(`${this.url}/v2/settlements/${id}`)
  }

  deleteSettlement(id: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${id}`)
  }

  postBillDiscount(settlementId: number, billDiscounts: TPostBillDiscountReq): Observable<{ id: number }> {
    return this.api.post(`${this.url}/v2/settlements/${settlementId}/bill-discounts`, { billDiscounts })
  }

  deleteBillDiscount(settlementId: number, itemId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${settlementId}/bill-discounts/${itemId}`)
  }

  postFreeItems(settlementId: number, freeItems: TPostFreeItemReq[]): Observable<{ ids: number[] }> {
    return this.api.post(`${this.url}/v2/settlements/${settlementId}/free-items`, { freeItems })
  }

  deleteFreeItem(settlementId: number, itemId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${settlementId}/free-items/${itemId}`)
  }

  postInvoice(settlementId: number, req: TPostInvoiceReq): Observable<{ id: number }> {
    return this.api.post(`${this.url}/v2/settlements/${settlementId}/invoices`, req)
  }

  deleteInvoice(settlementId: number, itemId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${settlementId}/invoices/${itemId}`)
  }

  postReceipt(settlementId: number, req: TPostReceiptWithMatchesReq): Observable<{ id: number }> {
    return this.api.post(`${this.url}/v2/settlements/${settlementId}/receipts`, req)
  }

  deleteReceipt(settlementId: number, itemId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${settlementId}/receipts/${itemId}`)
  }

  postMatch(settlementId: number, req: TPostMatchReq): Observable<{ id: number }> {
    return this.api.post(`${this.url}/v2/settlements/${settlementId}/matches`, req)
  }

  deleteMatch(settlementId: number, matchId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${settlementId}/matches/${matchId}`)
  }

  getMatches(settlementId: number): Observable<TOtherIncomeMatching[]> {
    return this.api.get(`${this.url}/v2/settlements/${settlementId}/matches`)
  }

  postCreditNote(settlementId: number, req: TPostCreditNoteReq): Observable<{ id: number }> {
    return this.api.post(`${this.url}/v2/settlements/${settlementId}/credit-notes`, { creditNotes: [req] })
  }

  deleteCreditNote(settlementId: number, itemId: number): Observable<void> {
    return this.api.delete(`${this.url}/v2/settlements/${settlementId}/credit-notes/${itemId}`)
  }

  getAccrualState(params: TAccrualStateParams): Observable<TAccrualStateRow[]> {
    return this.api.get(`${this.url}/v2/report/accrual-state`, { params })
  }

  getOrderConfirmationReport(contractId: number, params?: TGetOrderConfirmationReportParams): Observable<TOrderConfirmationReport> {
    return this.api.get(`${this.url}/v2/report/order-confirmation/${contractId}`, { params: compact(params ?? {}) })
  }

  searchBillDiscounts({ orderDateRange, order, ...params }: TBillDiscountSearchParams): Observable<TBillDiscountOrderLine[]> {
    return this.api.get(`${this.url}/v2/master/bill-discounts`, { params: toSearchQueryParams(params, order, orderDateRange) })
  }

  searchFreeProducts({ orderDateRange, order, ...params }: TFreeItemSearchParams): Observable<TFreeItemOrderLine[]> {
    return this.api.get(`${this.url}/v2/master/free-products`, { params: toSearchQueryParams(params, order, orderDateRange) })
  }
}

function toSearchQueryParams<T extends Record<string, string>>(base: T, order: string | null, orderDateRange: TDateRange) {
  return {
    ...base,
    ...(order ? { order } : {}),
    ...(orderDateRange.start ? { orderStart: orderDateRange.start } : {}),
    ...(orderDateRange.end ? { orderEnd: orderDateRange.end } : {}),
  }
}
