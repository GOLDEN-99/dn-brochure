import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TAddBranchReq, TBranchContractDetail, TCloseBranchReq, TIncomeEntry, TPostSettlementReq, TSettlementListItem } from '../../shared/types/other-income.type';
import { ForContractData } from '../../tokens/service-token';

@Injectable({
  providedIn: null,
})
export class BranchContractContextService implements ForContractData {
  private readonly api = inject(OtherIncomePurchaseApiService)
  private lastId: number | null = null

  contract = signal<TBranchContractDetail | null>(null)
  incomeEntries = signal<TIncomeEntry[]>([])
  settlements = signal<TSettlementListItem[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  load(id: number): void {
    this.lastId = id
    this.loading.set(true)
    this.error.set(null)
    forkJoin({
      contract: this.api.getBranchContract(id),
      incomeEntries: this.api.getIncomeEntries({ contractType: 'BRANCH', contractId: id }),
      settlements: this.api.getSettlements({ contractType: 'BRANCH', contractId: id }),
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
    return this.api.deleteBranchContract(id)
  }

  addBranch(id: number, req: TAddBranchReq): Observable<{ entryId: number; accruals_posted: number }> {
    return this.api.addBranch(id, req).pipe(tap(() => this.refresh()))
  }

  closeBranch(id: number, entryId: number, req: TCloseBranchReq): Observable<{ accruals_updated: number }> {
    return this.api.closeBranch(id, entryId, req).pipe(tap(() => this.refresh()))
  }

  addSettlement(req: TPostSettlementReq): Observable<TSettlementListItem> {
    if (this.contract()?.id == null) throw new Error('Contract not loaded')
    return this.api.postBranchSettlement(req).pipe(
      tap(settlement => {
        this.settlements.update(list => [...list, settlement])
        const pickedIds = new Set(req.incomeEntryIds)
        this.incomeEntries.update(list => list.map(e => pickedIds.has(e.id) ? { ...e, settlementId: settlement.id } : e))
      })
    )
  }
}
