import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPTY, merge, Subject, switchMap } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { z } from 'zod';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { TInvoiceStateRow } from '../../../shared/types/other-income.type';
import { CONTRACT_TYPE_PATH, CONTRACT_TYPE_LABEL, COMP_TYPE_LABEL } from '../../../shared/libs/settlement-labels';
import { XLSXReportService, TAoaConfig } from '../../../../service/xlsx-report/xlsx-report.service';

const invoiceFilterSchema = z.object({
  contractType: z.enum(['ORDER', 'BRANCH', 'PROMO']).nullable().default(null).catch(null),
  invoiceState: z.enum(['UNMATCHED', 'MATCHED']).nullable().default(null).catch(null),
  compType: z.enum(['DN', 'HU']).default('DN').catch('DN'),
})

const invoiceStateExportConfig: TAoaConfig<TInvoiceStateRow> = {
  sheetName: 'Invoice States',
  config: [
    { header: 'รหัสซัพ', valueMapper: row => row.compCode },
    { header: 'ชื่อซัพ', valueMapper: row => row.compName },
    { header: 'ประเภทสัญญา', valueMapper: row => CONTRACT_TYPE_LABEL[row.contractType] },
    { header: 'ประเภทกิจกรรม', valueMapper: row => row.contractLabelName },
    { header: 'เลขที่ใบแจ้งหนี้', valueMapper: row => row.invoiceNumb },
    { header: 'ยอดใบแจ้งหนี้', valueMapper: row => row.invoiceAmount },
    { header: 'ยอดจับคู่แล้ว', valueMapper: row => row.matchedAmount },
    { header: 'สถานะ', valueMapper: row => row.invoiceState },
    { header: 'เลขที่ใบเสร็จ', valueMapper: row => row.receiptNumbs ?? '' },
    { header: 'วันที่ใบเสร็จรับเงินล่าสุด', valueMapper: row => row.lastReceiptDate ?? '' },
  ],
}

/**
 * Filters are URL-driven (query params), not local signals — same pattern as
 * ContractListController (see purchase/components/pages/CLAUDE.md), so the
 * worklist view is bookmarkable/shareable and survives reload/back-button.
 * Filtering happens server-side (query params passed straight to the API),
 * so a filter change re-fetches rather than re-slicing a client-held array.
 */
@Component({
  selector: 'app-invoice-state-worklist-page',
  imports: [RouterLink, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './invoice-state-worklist-page.component.html',
  styleUrl: './invoice-state-worklist-page.component.scss',
})
export class InvoiceStateWorklistPageComponent {
  private readonly api = inject(OtherIncomeAccountApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly xlsx = inject(XLSXReportService)

  readonly contractTypeLabel = CONTRACT_TYPE_LABEL
  readonly contractTypePath = CONTRACT_TYPE_PATH
  readonly compTypeLabel = COMP_TYPE_LABEL

  items = signal<TInvoiceStateRow[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  private readonly refreshTrigger$ = new Subject<void>()

  private readonly filter$ = merge(
    this.route.queryParamMap,
    this.refreshTrigger$.pipe(map(() => this.route.snapshot.queryParamMap))
  ).pipe(
    map(params => invoiceFilterSchema.parse({
      contractType: params.get('contractType'),
      invoiceState: params.get('invoiceState'),
      compType: params.get('compType'),
    }))
  )

  readonly filters = toSignal(this.filter$, { initialValue: invoiceFilterSchema.parse({}) })

  constructor() {
    this.filter$.pipe(
      switchMap(filters => {
        this.loading.set(true)
        this.error.set(null)
        return this.api.getInvoiceStates({
          contractType: filters.contractType ?? undefined,
          invoiceState: filters.invoiceState ?? undefined,
          compType: filters.compType,
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
    const mapper = this.xlsx.convertJsonToWorkbook<TInvoiceStateRow>(invoiceStateExportConfig)
    const exporter = this.xlsx.exportWorkbook(`ใบแจ้งหนี้ค้างจับคู่ ${new Date().toISOString().split('T')[0]}`)
    mapper(this.items()).pipe(
      switchMap(wb => exporter(wb))
    ).subscribe()
  }

  setContractType(value: string): void {
    this.setQueryParams({ contractType: value || null })
  }

  setInvoiceState(value: string): void {
    this.setQueryParams({ invoiceState: value })
  }

  setCompType(value: string): void {
    this.setQueryParams({ compType: value || null })
  }

  isPartiallyReceived(row: TInvoiceStateRow): boolean {
    return row.invoiceState === 'UNMATCHED' && row.matchedAmount > 0
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
