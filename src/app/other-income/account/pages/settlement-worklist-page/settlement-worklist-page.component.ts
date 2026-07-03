import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { TSettlementOverviewItem } from '../../../shared/types/other-income.type';
import { BALANCE_STATE_LABEL, CONTRACT_TYPE_PATH, CONTRACT_TYPE_LABEL, INCOME_TYPE_LABEL, REVIEW_STATE_LABEL } from '../../../shared/libs/settlement-labels';

type TContractType = 'ORDER' | 'BRANCH' | 'PROMO';
type TBalanceState = 'OUTSTANDING' | 'SETTLED';
type TReviewState = 'UNREVIEWED' | 'REVIEWED';
type TIncomeType = 'Bill' | 'FreeItem' | 'Invoice' | 'CreditNote';

/**
 * Filters are URL-driven (query params), not local signals — same pattern as
 * ContractListController (see purchase/components/pages/CLAUDE.md), so the
 * worklist view is bookmarkable/shareable and survives reload/back-button.
 * Unlike that controller, filtering happens server-side (these endpoints
 * accept the filters as query params), so a filter change re-fetches rather
 * than re-slicing a client-held array.
 */
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

  readonly incomeTypeLabel = INCOME_TYPE_LABEL
  readonly contractTypeLabel = CONTRACT_TYPE_LABEL
  readonly balanceStateLabel = BALANCE_STATE_LABEL
  readonly reviewStateLabel = REVIEW_STATE_LABEL
  readonly contractTypePath = CONTRACT_TYPE_PATH

  items = signal<TSettlementOverviewItem[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  })

  contractType = computed<TContractType | null>(() => this.queryParamMap().get('contractType') as TContractType | null)
  balanceState = computed<TBalanceState | null>(() => this.queryParamMap().get('balanceState') as TBalanceState | null)
  reviewState = computed<TReviewState | null>(() => this.queryParamMap().get('reviewState') as TReviewState | null)
  /** Absent param → default to 'Invoice' (the common case); `incomeType=all` → explicit "all types". */
  incomeType = computed<TIncomeType | null>(() => {
    const raw = this.queryParamMap().get('incomeType')
    if (raw === 'all') return null
    return (raw as TIncomeType | null) ?? 'Invoice'
  })

  private readonly filters = computed(() => ({
    contractType: this.contractType() ?? undefined,
    balanceState: this.balanceState() ?? undefined,
    reviewState: this.reviewState() ?? undefined,
    incomeType: this.incomeType() ?? undefined,
  }))

  constructor() {
    effect(() => this.load(this.filters()))
  }

  load(filters: ReturnType<typeof this.filters>): void {
    this.loading.set(true)
    this.error.set(null)
    this.api.getSettlementsOverview(filters).subscribe({
      next: (items) => {
        this.items.set(items)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('โหลดข้อมูลไม่สำเร็จ')
        this.loading.set(false)
      },
    })
  }

  refresh(): void {
    this.load(this.filters())
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

  formatIncomeTypes(incomeTypes: TSettlementOverviewItem['incomeTypes']): string {
    return incomeTypes?.map(type => this.incomeTypeLabel[type]).join(', ') ?? '-'
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
