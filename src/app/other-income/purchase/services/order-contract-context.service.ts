import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { OtherIncomePurchaseApiService } from './other-income-purchase-api.service';
import { TIncomeEntry, TLagCorrectionRes, TPostCnCorrectionReq, TPostLagCorrectionReq, TPostManualCorrectionReq, TPostPairedSettlementReq, TPostPairedSettlementRes, TPostSettlementReq, TSettlementListItem } from '../../shared/types/other-income.type';
import { ForContractData } from '../../tokens/service-token';

@Injectable({
  providedIn: null,
})
export class OrderContractContextService implements ForContractData {
  private readonly api = inject(OtherIncomePurchaseApiService)

  private readonly id = signal<number | null>(null)

  private readonly contractResource = rxResource({
    params: () => this.id() ?? undefined,
    stream: ({ params: id }) => this.api.getOrderContract(id),
  })

  private readonly incomeEntriesResource = rxResource({
    params: () => this.id() ?? undefined,
    stream: ({ params: id }) => this.api.getIncomeEntries({ contractType: 'ORDER', contractId: id }),
    defaultValue: [] as TIncomeEntry[],
  })

  private readonly settlementsResource = rxResource({
    params: () => this.id() ?? undefined,
    stream: ({ params: id }) => this.api.getSettlements({ contractType: 'ORDER', contractId: id }),
    defaultValue: [] as TSettlementListItem[],
  })

  private readonly pairedEntriesResource = rxResource({
    params: () => {
      const contract = this.contractResource.value()
      if (contract?.supplierPairId == null) return undefined
      return { compType: contract.compType, id: contract.id }
    },
    stream: ({ params }) => this.api.getPairedIncomeEntries(
      params.compType === 'DN' ? { dnContractId: params.id } : { huContractId: params.id }
    ),
  })

  contract = computed(() => this.contractResource.value() ?? null)
  incomeEntries = computed(() => this.incomeEntriesResource.value() ?? [])
  settlements = computed(() => this.settlementsResource.value() ?? [])
  pairedEntries = computed(() => this.pairedEntriesResource.value() ?? null)

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
    return this.api.deleteOrderContract(id)
  }

  addCnCorrection(contractId: number, req: TPostCnCorrectionReq): Observable<TIncomeEntry> {
    return this.api.postCnCorrection(contractId, req).pipe(tap(() => this.incomeEntriesResource.reload()))
  }

  addLagCorrection(contractId: number, req: TPostLagCorrectionReq): Observable<TLagCorrectionRes> {
    return this.api.postLagCorrection(contractId, req).pipe(tap(() => this.incomeEntriesResource.reload()))
  }

  addManualCorrection(req: TPostManualCorrectionReq): Observable<TIncomeEntry> {
    return this.api.postManualCorrection(req).pipe(tap(() => this.incomeEntriesResource.reload()))
  }

  addSettlement(req: TPostSettlementReq): Observable<TSettlementListItem> {
    return this.api.postOrderSettlement(req).pipe(
      tap(() => {
        this.settlementsResource.reload()
        this.incomeEntriesResource.reload()
      })
    )
  }

  addPairedSettlement(req: TPostPairedSettlementReq): Observable<TPostPairedSettlementRes> {
    return this.api.postPairedSettlement(req).pipe(
      tap(() => {
        this.settlementsResource.reload()
        this.pairedEntriesResource.reload()
      })
    )
  }
}
