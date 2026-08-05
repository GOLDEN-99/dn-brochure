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
import { TBillDiscountStateRow } from '../../../shared/types/other-income.type';
import { CONTRACT_TYPE_PATH, CONTRACT_TYPE_LABEL, COMP_TYPE_LABEL } from '../../../shared/libs/settlement-labels';
import { toIsoDateOnly } from '../../../shared/libs/date-time';
import { XLSXReportService, TAoaConfig } from '../../../../service/xlsx-report/xlsx-report.service';

const CHECKED_BY = 'account_user'

const billDiscountFilterSchema = z.object({
  contractType: z.enum(['ORDER', 'BRANCH', 'PROMO']).nullable().default(null).catch(null),
  checkState: z.enum(['CHECKED', 'UNCHECKED']).nullable().default(null).catch(null),
  compType: z.enum(['DN', 'HU']).default('DN').catch('DN'),
})

const billDiscountExportConfig: TAoaConfig<TBillDiscountStateRow> = {
  sheetName: 'Bill Discount States',
  config: [
    { header: 'บริษัท', valueMapper: row => row.compType },
    { header: 'รหัสซัพ', valueMapper: row => row.compCode },
    { header: 'ชื่อซัพ', valueMapper: row => row.compName },
    { header: 'ประเภทสัญญา', valueMapper: row => CONTRACT_TYPE_LABEL[row.contractType] },
    { header: 'ประเภทกิจกรรม', valueMapper: row => row.contractLabelName },
    { header: 'กิจกรรมเริ่ม', valueMapper: row => toIsoDateOnly(row.contractStartDate) },
    { header: 'กิจกรรมจบ', valueMapper: row => toIsoDateOnly(row.contractEndDate) },
    { header: 'เลขที่ PO', valueMapper: row => row.orderNumb },
    { header: 'วันที่ PO', valueMapper: row => toIsoDateOnly(row.orderDate) },
    { header: 'เลขที่ RC', valueMapper: row => row.receNumb },
    { header: 'วันที่รับเข้า', valueMapper: row => toIsoDateOnly(row.receDate) },
    { header: 'ยอด', valueMapper: row => row.subtotalAmount },
    { header: 'สถานะตรวจสอบ', valueMapper: row => row.checkState },
    { header: 'ตรวจสอบเมื่อ', valueMapper: row => toIsoDateOnly(row.checkedAt) },
    { header: 'ตรวจสอบโดย', valueMapper: row => row.checkedBy ?? '' },
  ],
}

@Component({
  selector: 'app-bill-discount-state-worklist-page',
  imports: [RouterLink, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './bill-discount-state-worklist-page.component.html',
  styleUrl: './bill-discount-state-worklist-page.component.scss',
})
export class BillDiscountStateWorklistPageComponent {
  private readonly api = inject(OtherIncomeAccountApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly xlsx = inject(XLSXReportService)

  readonly contractTypeLabel = CONTRACT_TYPE_LABEL
  readonly contractTypePath = CONTRACT_TYPE_PATH
  readonly compTypeLabel = COMP_TYPE_LABEL

  items = signal<TBillDiscountStateRow[]>([])
  loading = signal(false)
  error = signal<string | null>(null)
  checkingId = signal<number | null>(null)

  private readonly refreshTrigger$ = new Subject<void>()

  private readonly filter$ = merge(
    this.route.queryParamMap,
    this.refreshTrigger$.pipe(map(() => this.route.snapshot.queryParamMap))
  ).pipe(
    map(params => billDiscountFilterSchema.parse({
      contractType: params.get('contractType'),
      checkState: params.get('checkState'),
      compType: params.get('compType'),
    }))
  )

  readonly filters = toSignal(this.filter$, { initialValue: billDiscountFilterSchema.parse({}) })

  constructor() {
    this.filter$.pipe(
      switchMap(filters => {
        this.loading.set(true)
        this.error.set(null)
        return this.api.getBillDiscountStates({
          contractType: filters.contractType ?? undefined,
          checkState: filters.checkState ?? undefined,
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
    const mapper = this.xlsx.convertJsonToWorkbook<TBillDiscountStateRow>(billDiscountExportConfig)
    const exporter = this.xlsx.exportWorkbook(`CN กับบิล ${new Date().toISOString().split('T')[0]}`)
    mapper(this.items()).pipe(
      switchMap(wb => exporter(wb))
    ).subscribe()
  }

  setContractType(value: string): void {
    this.setQueryParams({ contractType: value || null })
  }

  setCheckState(value: string): void {
    this.setQueryParams({ checkState: value || null })
  }

  setCompType(value: string): void {
    this.setQueryParams({ compType: value || null })
  }

  check(row: TBillDiscountStateRow): void {
    this.checkingId.set(row.billDiscountId)
    this.api.checkBillDiscount(row.settlementId, row.billDiscountId, CHECKED_BY).pipe(
      catchError(() => {
        this.error.set('ตรวจสอบไม่สำเร็จ')
        return EMPTY
      }),
      finalize(() => this.checkingId.set(null))
    ).subscribe(() => this.refresh())
  }

  remove(row: TBillDiscountStateRow): void {
    this.api.deleteBillDiscountState(row.settlementId, row.billDiscountId).pipe(
      catchError(() => {
        this.error.set('ลบไม่สำเร็จ')
        return EMPTY
      })
    ).subscribe(() => this.refresh())
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
