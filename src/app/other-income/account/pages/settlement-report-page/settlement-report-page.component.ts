import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, switchMap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OtherIncomeAccountApiService } from '../../services/other-income-account-api.service';
import { TSettlementReportRow, TSettlementContractResponse, CALC_TYPE_LABEL } from '../../../shared/types/other-income.type';
import { COMP_TYPE_LABEL } from '../../../shared/libs/settlement-labels';
import { XLSXReportService, TAoaConfig } from '../../../../service/xlsx-report/xlsx-report.service';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { isoToNgbDate, ngbDateToIso, startOfYearRange } from '../../../shared/libs/date-time';

const EXCLUDE_LABELS: Array<[keyof TSettlementContractResponse['spec'], string]> = [
  ['excludeVat', 'VAT'],
  ['excludeDc', 'DC'],
  ['excludeRebate', 'Rebate'],
  ['excludeInce', 'Incentive'],
  ['excludeComp', 'Comp'],
]

export function formatSpec(spec: TSettlementContractResponse['spec']): string {
  const parts = [
    `รูปแบบ ${CALC_TYPE_LABEL[spec.calcType] ?? spec.calcType}`,
    `เพดานยอดซื้อ ${spec.capAmount ?? 'ไม่กำหนด'} บาท`,
  ]
  const excludes = EXCLUDE_LABELS.filter(([key]) => spec[key]).map(([, label]) => label)
  if (excludes.length) parts.push(`ไม่รวม ${excludes.join(', ')}`)
  return parts.join(', ')
}

export function formatSteps(steps: TSettlementContractResponse['steps']): string {
  return steps
    .map(s => `ตั้งแต่ ${s.min.toLocaleString('th-TH')} บาท คิด ${s.rate}%`)
    .join(', ')
}

const exportConfig: TAoaConfig<TSettlementReportRow> = {
  sheetName: 'ปรับปรุงประมาณการ',
  config: [
    { header: 'Comp', valueMapper: row => row.contract.compType },
    { header: 'รหัสซัพพลายเออร์', valueMapper: row => row.contract.compCode },
    { header: 'ชื่อซัพพลายเออร์', valueMapper: row => row.contract.compName },
    { header: 'สัญญา', valueMapper: row => row.contract.contractLabelName },
    { header: 'เงื่อนไขการคำนวณ', valueMapper: row => formatSpec(row.contract.spec) },
    { header: 'ขั้นบันได', valueMapper: row => formatSteps(row.contract.steps) },
    { header: 'งวด', valueMapper: row => row.periodName },
    { header: 'เริ่ม', valueMapper: row => row.startDate?.slice(0, 10) },
    { header: 'จบ', valueMapper: row => row.endDate?.slice(0, 10) },
    { header: 'ยอดสั่งซื้อ (ระบบ)', valueMapper: row => row.systemOrderAmount ?? '' },
    { header: 'รายได้ (ระบบ)', valueMapper: row => row.systemIncome },
    { header: 'ยอดสั่งซื้อ (ซัพพลายเออร์)', valueMapper: row => row.supplierOrderAmount ?? '' },
    { header: 'รายได้ (ซัพพลายเออร์)', valueMapper: row => row.supplierIncome },
    { header: 'CN มากับบิล', valueMapper: row => row.billDiscountTotal },
    { header: 'สินค้าแถม', valueMapper: row => row.freeItemTotal },
    { header: 'ใบแจ้งหนี้', valueMapper: row => row.invoiceTotal },
    { header: 'CN', valueMapper: row => row.creditNoteTotal },
  ],
}

@Component({
  selector: 'app-settlement-report-page',
  imports: [DatePipe, DecimalPipe, FormsModule, DatePickerComponent],
  templateUrl: './settlement-report-page.component.html',
  styleUrl: './settlement-report-page.component.scss',
})
export class SettlementReportPageComponent {
  private readonly api = inject(OtherIncomeAccountApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly xlsx = inject(XLSXReportService)

  readonly compTypeLabel = COMP_TYPE_LABEL
  readonly formatSpec = formatSpec
  readonly formatSteps = formatSteps

  rows = signal<TSettlementReportRow[]>([])
  loading = signal(false)
  error = signal<string | null>(null)

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  })

  private readonly defaultRange = startOfYearRange()

  startDate = computed(() => this.queryParamMap().get('startDate') ?? this.defaultRange.startDate)
  endDate = computed(() => this.queryParamMap().get('endDate') ?? this.defaultRange.endDate)
  startDateValue = computed<NgbDateStruct>(() => isoToNgbDate(this.startDate()))
  endDateValue = computed<NgbDateStruct>(() => isoToNgbDate(this.endDate()))
  compType = computed<'DN' | 'HU' | null>(() => {
    const v = this.queryParamMap().get('compType')
    return v === 'DN' || v === 'HU' ? v : null
  })

  contractFilter = signal<number | null>(null)

  contractOptions = computed(() => {
    const seen = new Map<number, string>()
    for (const row of this.rows()) {
      if (!seen.has(row.contract.id)) {
        seen.set(row.contract.id, `${row.contract.compCode} ${row.contract.compName ?? ''} — ${row.contract.contractLabelName}`)
      }
    }
    return Array.from(seen, ([id, label]) => ({ id, label }))
  })

  filteredRows = computed(() => {
    const contractId = this.contractFilter()
    return this.rows().filter(row => contractId === null || row.contract.id === contractId)
  })

  constructor() {
    this.route.queryParamMap.pipe(
      switchMap(params => {
        this.loading.set(true)
        this.error.set(null)
        const compTypeParam = params.get('compType')
        return this.api.getSettlementReport({
          startDate: params.get('startDate') || this.defaultRange.startDate,
          endDate: params.get('endDate') || this.defaultRange.endDate,
          compType: compTypeParam === 'DN' || compTypeParam === 'HU' ? compTypeParam : undefined,
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
      this.contractFilter.set(null)
    })
  }

  setContractFilter(value: string): void {
    this.contractFilter.set(value ? Number(value) : null)
  }

  onStartDateChange(date: NgbDateStruct): void {
    this.setQueryParams({ startDate: ngbDateToIso(date) })
  }

  onEndDateChange(date: NgbDateStruct): void {
    this.setQueryParams({ endDate: ngbDateToIso(date) })
  }

  setCompType(value: string): void {
    this.setQueryParams({ compType: value || null })
  }

  exportExcel(): void {
    const mapper = this.xlsx.convertJsonToWorkbook<TSettlementReportRow>(exportConfig)
    const exporter = this.xlsx.exportWorkbook(`รายงานปรับปรุงประมาณการ ${new Date().toISOString().split('T')[0]}`)
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
