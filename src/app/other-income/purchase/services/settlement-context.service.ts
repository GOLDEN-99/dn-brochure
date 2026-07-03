import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TPostBillDiscountReq, TPostCreditNoteReq, TPostFreeItemReq, TPostInvoiceReq, TSettlementDetail } from '../../shared/types/other-income.type';

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

  addBillDiscount(req: TPostBillDiscountReq): Observable<{ id: number }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postBillDiscount(settlementId, req).pipe(
      tap(({ id }) => this.settlement.update(s => s && { ...s, billDiscounts: [...s.billDiscounts, { id, ...req }] }))
    )
  }

  removeBillDiscount(itemId: number): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteBillDiscount(settlementId, itemId).pipe(
      tap(() => this.settlement.update(s => s && { ...s, billDiscounts: s.billDiscounts.filter(row => row.id !== itemId) }))
    )
  }

  addFreeItem(req: TPostFreeItemReq): Observable<{ id: number }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postFreeItem(settlementId, req).pipe(
      tap(({ id }) => this.settlement.update(s => s && { ...s, freeItems: [...s.freeItems, { id, ...req }] }))
    )
  }

  removeFreeItem(itemId: number): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteFreeItem(settlementId, itemId).pipe(
      tap(() => this.settlement.update(s => s && { ...s, freeItems: s.freeItems.filter(row => row.id !== itemId) }))
    )
  }

  addInvoice(req: TPostInvoiceReq): Observable<{ id: number }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postInvoice(settlementId, req).pipe(
      tap(({ id }) => this.settlement.update(s => s && { ...s, invoices: [...s.invoices, { id, ...req }] }))
    )
  }

  addCreditNote(req: TPostCreditNoteReq): Observable<{ id: number }> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.postCreditNote(settlementId, req).pipe(
      tap(({ id }) => this.settlement.update(s => s && { ...s, creditNotes: [...s.creditNotes, { id, ...req }] }))
    )
  }

  removeCreditNote(itemId: number): Observable<void> {
    const settlementId = this.settlement()?.id
    if (settlementId == null) throw new Error('Settlement not loaded')
    return this.api.deleteCreditNote(settlementId, itemId).pipe(
      tap(() => this.settlement.update(s => s && { ...s, creditNotes: s.creditNotes.filter(row => row.id !== itemId) }))
    )
  }
}
