import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TAddBranchReq, TCloseBranchReq, TIncomeEntry, TPostSettlementReq, TSettlementListItem } from '../../shared/types/other-income.type';
import { ForContractData } from '../../tokens/service-token';

@Injectable({
  providedIn: null,
})
export class BranchContractContextService implements ForContractData {
  private readonly api = inject(OtherIncomePurchaseApiService)

  private readonly id = signal<number | null>(null)

  private readonly contractResource = rxResource({
    params: () => this.id() ?? undefined,
    stream: ({ params: id }) => this.api.getBranchContract(id),
  })

  private readonly incomeEntriesResource = rxResource({
    params: () => this.id() ?? undefined,
    stream: ({ params: id }) => this.api.getIncomeEntries({ contractType: 'BRANCH', contractId: id }),
    defaultValue: [] as TIncomeEntry[],
  })

  private readonly settlementsResource = rxResource({
    params: () => this.id() ?? undefined,
    stream: ({ params: id }) => this.api.getSettlements({ contractType: 'BRANCH', contractId: id }),
    defaultValue: [] as TSettlementListItem[],
  })

  contract = computed(() => this.contractResource.value() ?? null)
  incomeEntries = computed(() => this.incomeEntriesResource.value() ?? [])
  settlements = computed(() => this.settlementsResource.value() ?? [])

  loading = computed(() =>
    this.contractResource.isLoading() || this.incomeEntriesResource.isLoading() || this.settlementsResource.isLoading()
  )

  error = computed(() =>
    (this.contractResource.error() || this.incomeEntriesResource.error() || this.settlementsResource.error())
      ? 'โหลดข้อมูลไม่สำเร็จ'
      : null
  )

  setId(id: number): void {
    this.id.set(id)
  }

  refresh(): void {
    this.contractResource.reload()
    this.incomeEntriesResource.reload()
    this.settlementsResource.reload()
  }

  incomeEntriesRefresh(): void {
    this.incomeEntriesResource.reload()
  }

  settlementsRefresh(): void {
    this.settlementsResource.reload()
  }

  refreshChildren(): void {
    this.incomeEntriesResource.reload()
    this.settlementsResource.reload()
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
      tap(() => {
        this.settlementsResource.reload()
        this.incomeEntriesResource.reload()
      })
    )
  }
}
