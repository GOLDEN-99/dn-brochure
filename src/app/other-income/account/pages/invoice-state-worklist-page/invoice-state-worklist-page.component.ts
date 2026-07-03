import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { TInvoiceStateRow } from '../../../shared/types/other-income.type';
import { CONTRACT_TYPE_PATH, CONTRACT_TYPE_LABEL } from '../../../shared/libs/settlement-labels';

type TContractType = 'ORDER' | 'BRANCH' | 'PROMO';
type TInvoiceState = 'UNMATCHED' | 'MATCHED';

/**
 * Filters are URL-driven (query params), not local signals — same pattern as
 * ContractListController (see purchase/components/pages/CLAUDE.md), so the
 * worklist view is bookmarkable/shareable and survives reload/back-button.
 * Filtering happens server-side (query params passed straight to the API),
 * so a filter change re-fetches rather than re-slicing a client-held array.
 */
@Component({
  selector: 'app-invoice-state-worklist-page',
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './invoice-state-worklist-page.component.html',
  styleUrl: './invoice-state-worklist-page.component.scss',
})
export class InvoiceStateWorklistPageComponent {
  private readonly api = inject(OtherIncomeAccountApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  readonly contractTypeLabel = CONTRACT_TYPE_LABEL
  readonly contractTypePath = CONTRACT_TYPE_PATH

  items = signal<TInvoiceStateRow[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  })

  contractType = computed<TContractType | null>(() => this.queryParamMap().get('contractType') as TContractType | null)

  /** Absent param → default to 'UNMATCHED' (the common case); `invoiceState=all` → explicit "all". */
  invoiceState = computed<TInvoiceState | null>(() => {
    const raw = this.queryParamMap().get('invoiceState')
    if (raw === 'all') return null
    return (raw as TInvoiceState | null) ?? 'UNMATCHED'
  })

  private readonly filters = computed(() => ({
    contractType: this.contractType() ?? undefined,
    invoiceState: this.invoiceState() ?? undefined,
  }))

  constructor() {
    effect(() => this.load(this.filters()))
  }

  load(filters: ReturnType<typeof this.filters>): void {
    this.loading.set(true)
    this.error.set(null)
    this.api.getInvoiceStates(filters).subscribe({
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

  setInvoiceState(value: string): void {
    this.setQueryParams({ invoiceState: value })
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
