import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, switchMap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { OtherIncomeEventService } from '../../../shared/services/other-income-event.service';
import { TContributingProductRow } from '../../../shared/types/other-income.type';
import { COMP_TYPE_LABEL } from '../../../shared/libs/settlement-labels';
import { XLSXReportService, TAoaConfig } from '../../../../service/xlsx-report/xlsx-report.service';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { isoToNgbDate, ngbDateToIso, startOfYearRange, toIsoDateOnly } from '../../../shared/libs/date-time';

const exportConfig: TAoaConfig<TContributingProductRow> = {
  sheetName: 'DC Rebate Products',
  config: [
    { header: 'เลขที่สัญญา', valueMapper: row => row.contractId },
    { header: 'กิจกรรม', valueMapper: row => row.eventName },
    { header: 'บริษัท', valueMapper: row => row.compType },
    { header: 'รหัสซัพ', valueMapper: row => row.compCode },
    { header: 'ชื่อซัพ', valueMapper: row => row.compName ?? '' },
    { header: 'กิจกรรมเริ่ม', valueMapper: row => toIsoDateOnly(row.contractStartDate) },
    { header: 'กิจกรรมจบ', valueMapper: row => toIsoDateOnly(row.contractEndDate) },
    { header: 'รหัสสินค้า', valueMapper: row => row.barCode ?? '' },
    { header: 'ชื่อสินค้า', valueMapper: row => row.goodName },
    { header: 'ยอดรับเข้าไม่หักเงื่อนไข', valueMapper: row => row.receivedAmount },
  ],
}

@Component({
  selector: 'app-contributing-products-report-page',
  imports: [DatePipe, DecimalPipe, FormsModule, DatePickerComponent],
  templateUrl: './contributing-products-report-page.component.html',
  styleUrl: './contributing-products-report-page.component.scss',
})
export class ContributingProductsReportPageComponent {
  private readonly api = inject(OtherIncomeAccountApiService)
  private readonly eventService = inject(OtherIncomeEventService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly xlsx = inject(XLSXReportService)

  readonly compTypeLabel = COMP_TYPE_LABEL

  rows = signal<TContributingProductRow[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  })

  private readonly defaultRange = startOfYearRange()

  periodFrom = computed(() => this.queryParamMap().get('periodFrom') ?? this.defaultRange.startDate)
  periodTo = computed(() => this.queryParamMap().get('periodTo') ?? this.defaultRange.endDate)
  periodFromDate = computed<NgbDateStruct>(() => isoToNgbDate(this.periodFrom()))
  periodToDate = computed<NgbDateStruct>(() => isoToNgbDate(this.periodTo()))
  compType = computed<'DN' | 'HU'>(() => (this.queryParamMap().get('compType') === 'HU' ? 'HU' : 'DN'))
  contractLabelId = computed<number | null>(() => {
    const raw = this.queryParamMap().get('contractLabelId')
    return raw ? Number(raw) : null
  })
  compCode = computed(() => this.queryParamMap().get('compCode') ?? '')
  compName = computed(() => this.queryParamMap().get('compName') ?? '')
  barCode = computed(() => this.queryParamMap().get('barCode') ?? '')
  goodName = computed(() => this.queryParamMap().get('goodName') ?? '')

  /** DC vs Rebate is filtered via the contract label, not the spec's excludeDc/excludeRebate flags. */
  eventOptions = computed(() => this.eventService.event().filter(e => e.eventType === 'ORDER'))

  totalReceivedAmount = computed(() => this.rows().reduce((sum, row) => sum + row.receivedAmount, 0))

  constructor() {
    this.route.queryParamMap.pipe(
      switchMap(params => {
        this.loading.set(true)
        this.error.set(null)
        const labelId = params.get('contractLabelId')
        return this.api.getContributingProducts({
          periodFrom: params.get('periodFrom') || this.defaultRange.startDate,
          periodTo: params.get('periodTo') || this.defaultRange.endDate,
          compType: params.get('compType') === 'HU' ? 'HU' : 'DN',
          contractLabelId: labelId ? Number(labelId) : undefined,
          compCode: params.get('compCode')?.trim() || undefined,
          compName: params.get('compName')?.trim() || undefined,
          barCode: params.get('barCode')?.trim() || undefined,
          goodName: params.get('goodName')?.trim() || undefined,
        }).pipe(
          catchError(() => {
            this.error.set('โหลดข้อมูลไม่สำเร็จ')
            return EMPTY
          }),
          finalize(() => this.loading.set(false))
        )
      }),
      takeUntilDestroyed()
    ).subscribe(data => this.rows.set(data))
  }

  onPeriodFromChange(date: NgbDateStruct): void {
    this.setQueryParams({ periodFrom: ngbDateToIso(date) })
  }

  onPeriodToChange(date: NgbDateStruct): void {
    this.setQueryParams({ periodTo: ngbDateToIso(date) })
  }

  setCompType(value: string): void {
    this.setQueryParams({ compType: value || null })
  }

  setContractLabelId(value: number | null): void {
    this.setQueryParams({ contractLabelId: value === null ? null : String(value) })
  }

  setCompCode(value: string): void {
    this.setQueryParams({ compCode: value.trim() || null })
  }

  setCompName(value: string): void {
    this.setQueryParams({ compName: value.trim() || null })
  }

  setBarCode(value: string): void {
    this.setQueryParams({ barCode: value.trim() || null })
  }

  setGoodName(value: string): void {
    this.setQueryParams({ goodName: value.trim() || null })
  }

  exportExcel(): void {
    const mapper = this.xlsx.convertJsonToWorkbook<TContributingProductRow>(exportConfig)
    const exporter = this.xlsx.exportWorkbook(`รายการสินค้าเข้าร่วม DC Rebate ${new Date().toISOString().split('T')[0]}`)
    mapper(this.rows()).pipe(
      switchMap(wb => exporter(wb))
    ).subscribe()
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
