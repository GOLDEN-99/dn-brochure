import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TIncomeEntry, TPostPromoAccrualReq, TPostSettlementReq, TPromoContractDetail, TSettlementListItem } from '../../shared/types/other-income.type';
import { ForContractData } from '../../tokens/service-token';

@Injectable({
  providedIn: null,
})
export class PromoContractContextService implements ForContractData {
  private readonly api = inject(OtherIncomePurchaseApiService)
  private lastId: number | null = null

  contract = signal<TPromoContractDetail | null>(null)
  incomeEntries = signal<TIncomeEntry[]>([])
  settlements = signal<TSettlementListItem[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  load(id: number): void {
    this.lastId = id
    this.loading.set(true)
    this.error.set(null)
    forkJoin({
      contract: this.api.getPromoContract(id),
      incomeEntries: this.api.getIncomeEntries({ contractType: 'PROMO', contractId: id }),
      settlements: this.api.getSettlements({ contractType: 'PROMO', contractId: id }),
    }).subscribe({
      next: ({ contract, incomeEntries, settlements }) => {
        this.contract.set(contract)
        this.incomeEntries.set(incomeEntries)
        this.settlements.set(settlements)
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

  deleteContract(): Observable<void> {
    const id = this.contract()?.id
    if (id == null) throw new Error('Contract not loaded')
    return this.api.deletePromoContract(id)
  }

  addPromoAccrual(id: number, req: TPostPromoAccrualReq): Observable<TIncomeEntry> {
    return this.api.postPromoAccrual(id, req).pipe(tap(() => this.refresh()))
  }

  deletePromoAccrual(accrualId: number): Observable<void> {
    return this.api.deletePromoAccrual(accrualId).pipe(
      tap(() => this.incomeEntries.update(list => list.filter(e => e.id !== accrualId)))
    )
  }

  addSettlement(req: TPostSettlementReq): Observable<TSettlementListItem> {
    if (this.contract()?.id == null) throw new Error('Contract not loaded')
    return this.api.postPromoSettlement(req).pipe(
      tap(settlement => {
        this.settlements.update(list => [...list, settlement])
        const pickedIds = new Set(req.incomeEntryIds)
        this.incomeEntries.update(list => list.map(e => pickedIds.has(e.id) ? { ...e, settlementId: settlement.id } : e))
      })
    )
  }
}
