import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPTY, merge, Subject, switchMap } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { z } from 'zod';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { TSettlementOverviewItem } from '../../../shared/types/other-income.type';
import { BALANCE_STATE_LABEL, COMP_TYPE_LABEL, CONTRACT_TYPE_PATH, CONTRACT_TYPE_LABEL, INCOME_TYPE_LABEL, REVIEW_STATE_LABEL } from '../../../shared/libs/settlement-labels';
import { XLSXReportService, TAoaConfig } from '../../../../service/xlsx-report/xlsx-report.service';

const settlementFilterSchema = z.object({
  contractType: z.enum(['ORDER', 'BRANCH', 'PROMO']).nullable().default(null).catch(null),
  balanceState: z.enum(['OUTSTANDING', 'SETTLED']).nullable().default(null).catch(null),
  reviewState: z.enum(['UNREVIEWED', 'REVIEWED']).nullable().default(null).catch(null),
  incomeType: z.enum(['Bill', 'FreeItem', 'Invoice', 'CreditNote']).nullable().default(null).catch(null),
  compType: z.enum(['DN', 'HU']).default('DN').catch('DN'),
})

/**
 * Filters are URL-driven (query params), not local signals — same pattern as
 * ContractListController (see purchase/components/pages/CLAUDE.md), so the
 * worklist view is bookmarkable/shareable and survives reload/back-button.
 * Unlike that controller, filtering happens server-side (these endpoints
 * accept the filters as query params), so a filter change re-fetches rather
 * than re-slicing a client-held array.
 */
const settlementExportConfig: TAoaConfig<TSettlementOverviewItem> = {
  sheetName: 'Settlements',
  config: [
    { header: 'ประเภทสัญญา', valueMapper: row => CONTRACT_TYPE_LABEL[row.contractType] },
    { header: 'Comp', valueMapper: row => row.compType },
    { header: 'รหัสซัพพลายเออร์', valueMapper: row => row.compCode },
    { header: 'ชื่อซัพพลายเออร์', valueMapper: row => row.compName },
    { header: 'รอบ', valueMapper: row => row.periodName },
    { header: 'เริ่ม', valueMapper: row => row.startDate?.slice(0, 10) ?? '' },
    { header: 'จบ', valueMapper: row => row.endDate?.slice(0, 10) ?? '' },
    { header: 'ประเภทรายได้', valueMapper: row => row.incomeLabelName ?? INCOME_TYPE_LABEL[row.incomeType] },
    { header: 'ยอดซัพพลายเออร์', valueMapper: row => row.supplierIncome },
    { header: 'ยอดแนบเอกสาร', valueMapper: row => row.appendedTotal },
    { header: 'คงเหลือ', valueMapper: row => row.remaining },
    { header: 'สถานะยอด', valueMapper: row => BALANCE_STATE_LABEL[row.balanceState] },
    { header: 'สถานะตรวจสอบ', valueMapper: row => REVIEW_STATE_LABEL[row.reviewState] },
  ],
}

@Component({
  selector: 'app-settlement-worklist-page',
  imports: [RouterLink, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './settlement-worklist-page.component.html',
  styleUrl: './settlement-worklist-page.component.scss',
})
export class SettlementWorklistPageComponent {
  private readonly api = inject(OtherIncomeAccountApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly xlsx = inject(XLSXReportService)

  readonly incomeTypeLabel = INCOME_TYPE_LABEL
  readonly contractTypeLabel = CONTRACT_TYPE_LABEL
  readonly balanceStateLabel = BALANCE_STATE_LABEL
  readonly reviewStateLabel = REVIEW_STATE_LABEL
  readonly compTypeLabel = COMP_TYPE_LABEL
  readonly contractTypePath = CONTRACT_TYPE_PATH

  items = signal<TSettlementOverviewItem[]>([])
  loading = signal(false)
  error = signal<string | null>(null)
  searchText = signal('')

  filteredItems = computed(() => {
    const q = this.searchText().trim().toLowerCase()
    if (!q) return this.items()
    return this.items().filter(item =>
      item.compCode.toLowerCase().includes(q) ||
      item.compName.toLowerCase().includes(q)
    )
  })

  private readonly refreshTrigger$ = new Subject<void>()

  private readonly filter$ = merge(
    this.route.queryParamMap,
    this.refreshTrigger$.pipe(map(() => this.route.snapshot.queryParamMap))
  ).pipe(
    map(params => settlementFilterSchema.parse({
      contractType: params.get('contractType'),
      balanceState: params.get('balanceState'),
      reviewState: params.get('reviewState'),
      incomeType: params.get('incomeType'),
      compType: params.get('compType'),
    }))
  )

  readonly filters = toSignal(this.filter$, { initialValue: settlementFilterSchema.parse({}) })

  constructor() {
    this.filter$.pipe(
      switchMap(filters => {
        this.loading.set(true)
        this.error.set(null)
        return this.api.getSettlementsOverview({
          contractType: filters.contractType ?? undefined,
          balanceState: filters.balanceState ?? undefined,
          reviewState: filters.reviewState ?? undefined,
          incomeType: filters.incomeType ?? undefined,
          compType: filters.compType ?? undefined,
        }).pipe(
          catchError(() => {
            this.error.set('โหลดข้อมูลไม่สำเร็จ')
            return EMPTY
          }),
          finalize(() => this.loading.set(false))
        )
      }),
      takeUntilDestroyed()
    ).subscribe(items => this.items.set(items))
  }

  refresh(): void {
    this.refreshTrigger$.next()
  }

  exportExcel(): void {
    const mapper = this.xlsx.convertJsonToWorkbook<TSettlementOverviewItem>(settlementExportConfig)
    const exporter = this.xlsx.exportWorkbook(`รายการชำระ ${new Date().toISOString().split('T')[0]}`)
    mapper(this.filteredItems()).pipe(
      switchMap(wb => exporter(wb))
    ).subscribe()
  }

  setContractType(value: string): void {
    this.setQueryParams({ contractType: value || null })
  }

  setBalanceState(value: string): void {
    this.setQueryParams({ balanceState: value || null })
  }

  setReviewState(value: string): void {
    this.setQueryParams({ reviewState: value || null })
  }

  setIncomeType(value: string): void {
    this.setQueryParams({ incomeType: value })
  }

  setCompType(value: string): void {
    this.setQueryParams({ compType: value || null })
  }

  private setQueryParams(params: Record<string, string | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }
}
