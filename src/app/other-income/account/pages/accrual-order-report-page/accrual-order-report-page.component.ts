import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, switchMap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { TAccrualOrderReportRow, CALC_TYPE_LABEL } from '../../../shared/types/other-income.type';
import { COMP_TYPE_LABEL, formatIncomeTypes } from '../../../shared/libs/settlement-labels';
import { XLSXReportService, TAoaConfig } from '../../../../service/xlsx-report/xlsx-report.service';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { isoToNgbDate, ngbDateToIso, startOfYearRange, toIsoDateOnly } from '../../../shared/libs/date-time';

type TOrderReportFlatRow = {
  contractId: number
  compCode: string
  compName: string
  compType: 'DN' | 'HU'
  contractLabelId: number
  contractLabelName: string
  startDate: string | null
  endDate: string | null
  incomeTypes: string
  calcType: string
  steps: string
  month: string
  netOrderAmount: number
  estimateIncome: number
}

function formatSteps(steps: TAccrualOrderReportRow['steps']): string {
  return steps
    .map(s => `ตั้งแต่ ${s.min.toLocaleString('th-TH')} บาท คิด ${s.rate}%`)
    .join(', ')
}

function flatten(rows: TAccrualOrderReportRow[]): TOrderReportFlatRow[] {
  return rows.flatMap(row => row.months.map(m => ({
    contractId: row.contractId,
    compCode: row.compCode,
    compName: row.compName ?? '',
    compType: row.compType,
    contractLabelId: row.contractLabelId,
    contractLabelName: row.contractLabelName,
    startDate: row.startDate,
    endDate: row.endDate,
    incomeTypes: formatIncomeTypes(row.incomeTypes),
    calcType: CALC_TYPE_LABEL[row.calcType] ?? row.calcType,
    steps: formatSteps(row.steps),
    month: m.month,
    netOrderAmount: m.netOrderAmount,
    estimateIncome: m.estimateIncome,
  })))
}

const exportConfig: TAoaConfig<TOrderReportFlatRow> = {
  sheetName: 'DC Rebate',
  config: [
    { header: 'Comp', valueMapper: row => row.compType },
    { header: 'รหัสซัพพลายเออร์', valueMapper: row => row.compCode },
    { header: 'ชื่อซัพพลายเออร์', valueMapper: row => row.compName },
    { header: 'สัญญา', valueMapper: row => row.contractLabelName },
    { header: 'กิจกรรมเริ่ม', valueMapper: row => toIsoDateOnly(row.startDate) },
    { header: 'กิจกรรมจบ', valueMapper: row => toIsoDateOnly(row.endDate) },
    { header: 'วิธีรับรู้', valueMapper: row => row.incomeTypes },
    { header: 'วิธีคำนวณ', valueMapper: row => row.calcType },
    { header: 'ขั้นบันได', valueMapper: row => row.steps },
    { header: 'เดือน', valueMapper: row => row.month?.slice(0, 7) ?? '' },
    { header: 'ยอดสั่งซื้อสุทธิ', valueMapper: row => row.netOrderAmount },
    { header: 'ประมาณการรายได้', valueMapper: row => row.estimateIncome },
  ],
}

@Component({
  selector: 'app-accrual-order-report-page',
  imports: [DatePipe, DecimalPipe, SlicePipe, FormsModule, DatePickerComponent],
  templateUrl: './accrual-order-report-page.component.html',
  styleUrl: './accrual-order-report-page.component.scss',
})
export class AccrualOrderReportPageComponent {
  private readonly api = inject(OtherIncomeAccountApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly xlsx = inject(XLSXReportService)

  readonly compTypeLabel = COMP_TYPE_LABEL

  rows = signal<TAccrualOrderReportRow[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  })

  private readonly defaultRange = startOfYearRange()

  monthFrom = computed(() => this.queryParamMap().get('monthFrom') ?? this.defaultRange.startDate)
  monthTo = computed(() => this.queryParamMap().get('monthTo') ?? this.defaultRange.endDate)
  monthFromDate = computed<NgbDateStruct>(() => isoToNgbDate(this.monthFrom()))
  monthToDate = computed<NgbDateStruct>(() => isoToNgbDate(this.monthTo()))
  compType = computed<'DN' | 'HU'>(() => {
    const v = this.queryParamMap().get('compType')
    return v === 'HU' ? 'HU' : 'DN'
  })

  flatRows = computed(() => flatten(this.rows()))

  eventTypeFilter = signal<number | null>(null)
  contractFilter = signal<number | null>(null)

  eventTypeOptions = computed(() => {
    const seen = new Map<number, string>()
    for (const row of this.flatRows()) {
      if (!seen.has(row.contractLabelId)) seen.set(row.contractLabelId, row.contractLabelName)
    }
    return Array.from(seen, ([id, name]) => ({ id, name }))
  })

  contractOptions = computed(() => {
    const seen = new Map<number, string>()
    for (const row of this.flatRows()) {
      if (!seen.has(row.contractId)) seen.set(row.contractId, `${row.compCode} ${row.compName} — ${row.contractLabelName}`)
    }
    return Array.from(seen, ([id, label]) => ({ id, label }))
  })

  filteredRows = computed(() => {
    const eventTypeId = this.eventTypeFilter()
    const contractId = this.contractFilter()
    return this.flatRows().filter(row =>
      (eventTypeId === null || row.contractLabelId === eventTypeId) &&
      (contractId === null || row.contractId === contractId)
    )
  })

  constructor() {
    this.route.queryParamMap.pipe(
      switchMap(params => {
        this.loading.set(true)
        this.error.set(null)
        const compTypeParam = params.get('compType')
        return this.api.getAccrualOrderReport({
          monthFrom: params.get('monthFrom') || undefined,
          monthTo: params.get('monthTo') || undefined,
          compType: compTypeParam === 'HU' ? 'HU' : 'DN',
        }).pipe(
          catchError(() => {
            this.error.set('โหลดข้อมูลไม่สำเร็จ')
            return EMPTY
          }),
          finalize(() => this.loading.set(false))
        )
      }),
      takeUntilDestroyed()
    ).subscribe(data => {
      this.rows.set(data)
      this.eventTypeFilter.set(null)
      this.contractFilter.set(null)
    })
  }

  setEventTypeFilter(value: string): void {
    this.eventTypeFilter.set(value ? Number(value) : null)
  }

  setContractFilter(value: string): void {
    this.contractFilter.set(value ? Number(value) : null)
  }

  onMonthFromChange(date: NgbDateStruct): void {
    this.setQueryParams({ monthFrom: ngbDateToIso(date) })
  }

  onMonthToChange(date: NgbDateStruct): void {
    this.setQueryParams({ monthTo: ngbDateToIso(date) })
  }

  setCompType(value: string): void {
    this.setQueryParams({ compType: value || null })
  }

  exportExcel(): void {
    const mapper = this.xlsx.convertJsonToWorkbook<TOrderReportFlatRow>(exportConfig)
    const exporter = this.xlsx.exportWorkbook(`DC Rebate ${new Date().toISOString().split('T')[0]}`)
    mapper(this.filteredRows()).pipe(
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
