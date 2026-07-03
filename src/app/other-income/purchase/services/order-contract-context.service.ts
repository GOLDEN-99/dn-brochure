import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TIncomeEntry, TLagCorrectionRes, TOrderContractDetail, TPostCnCorrectionReq, TPostLagCorrectionReq, TPostManualCorrectionReq, TPostSettlementReq, TSettlementListItem } from '../../shared/types/other-income.type';
import { ForContractData } from '../../tokens/service-token';

@Injectable({
  providedIn: null,
})
export class OrderContractContextService implements ForContractData {
  private readonly api = inject(OtherIncomePurchaseApiService)
  private lastId: number | null = null

  contract = signal<TOrderContractDetail | null>(null)
  incomeEntries = signal<TIncomeEntry[]>([])
  settlements = signal<TSettlementListItem[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  load(id: number): void {
    this.lastId = id
    this.loading.set(true)
    this.error.set(null)
    forkJoin({
      contract: this.api.getOrderContract(id),
      incomeEntries: this.api.getIncomeEntries({ contractType: 'ORDER', contractId: id }),
      settlements: this.api.getSettlements({ contractType: 'ORDER', contractId: id }),
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

  addCnCorrection(contractId: number, req: TPostCnCorrectionReq): Observable<TIncomeEntry> {
    return this.api.postCnCorrection(contractId, req).pipe(tap(entry => this.incomeEntries.update(list => [...list, entry])))
  }

  addLagCorrection(contractId: number, req: TPostLagCorrectionReq): Observable<TLagCorrectionRes> {
    return this.api.postLagCorrection(contractId, req).pipe(
      tap(({ monthEntry, nextMonthEntry }) => this.incomeEntries.update(list => [...list, monthEntry, nextMonthEntry]))
    )
  }

  addManualCorrection(req: TPostManualCorrectionReq): Observable<TIncomeEntry> {
    return this.api.postManualCorrection(req).pipe(tap(entry => this.incomeEntries.update(list => [...list, entry])))
  }

  addSettlement(req: TPostSettlementReq): Observable<TSettlementListItem> {
    return this.api.postOrderSettlement(req).pipe(
      tap(settlement => {
        this.settlements.update(list => [...list, settlement])
        const pickedIds = new Set(req.incomeEntryIds)
        this.incomeEntries.update(list => list.map(e => pickedIds.has(e.id) ? { ...e, settlementId: settlement.id } : e))
      })
    )
  }
}
