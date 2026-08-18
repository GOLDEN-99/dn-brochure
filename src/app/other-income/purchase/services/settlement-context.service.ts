import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TPostBillDiscountReq, TPostCreditNoteReq, TPostFreeItemReq, TPostInvoiceReq, TPostReceiptWithMatchesReq, TSettlementDetail } from '../../shared/types/other-income.type';

@Injectable({
  providedIn: null,
})
export class SettlementContextService {
  private readonly api = inject(OtherIncomePurchaseApiService)
  private lastId: number | null = null

  settlement = signal<TSettlementDetail | null>(null)
  loading = signal(false)
  error = signal<string | null>(null)

  load(id: number): void {
    this.lastId = id
    this.loading.set(true)
    this.error.set(null)
    this.api.getSettlementDetail(id).subscribe({
      next: (settlement) => {
        this.settlement.set(settlement)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('โหลดข้อมูลไม่สำเร็จ')
        this.loading.set(false)
      },
    })
  }

  refresh(): void {
    if (this.lastId !== null) this.load(this.lastId)
  }

  deleteSettlement(): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteSettlement(settlementId)
  }

  addBillDiscounts(reqs: TPostBillDiscountReq[]): Observable<{ ids: number[] }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postBillDiscounts(settlementId, reqs).pipe(
      tap(() => this.refresh())
    )
  }

  removeBillDiscount(itemId: number): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteBillDiscount(settlementId, itemId).pipe(
      tap(() => this.refresh())
    )
  }

  addFreeItems(reqs: TPostFreeItemReq[]): Observable<{ ids: number[] }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postFreeItems(settlementId, reqs).pipe(
      tap(() => this.refresh())
    )
  }

  removeFreeItem(itemId: number): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteFreeItem(settlementId, itemId).pipe(
      tap(() => this.refresh())
    )
  }

  addInvoice(req: TPostInvoiceReq): Observable<{ id: number }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postInvoice(settlementId, req).pipe(
      tap(() => this.refresh())
    )
  }

  addReceipt(req: TPostReceiptWithMatchesReq): Observable<{ id: number }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postReceipt(settlementId, req).pipe(
      tap(() => this.refresh())
    )
  }

  removeInvoice(itemId: number): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteInvoice(settlementId, itemId).pipe(
      tap(() => this.refresh())
    )
  }

  removeReceipt(itemId: number): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteReceipt(settlementId, itemId).pipe(
      tap(() => this.refresh())
    )
  }

  addCreditNote(req: TPostCreditNoteReq): Observable<{ id: number }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postCreditNote(settlementId, req).pipe(
      tap(() => this.refresh())
    )
  }

  removeCreditNote(itemId: number): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteCreditNote(settlementId, itemId).pipe(
      tap(() => this.refresh())
    )
  }
}
