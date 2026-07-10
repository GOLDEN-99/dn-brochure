import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OrderContractContextService } from '../../../../purchase/services/order-contract-context.service';
import { OtherIncomePurchaseApiService } from '../../../../purchase/services/other-income-purchase-api.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { XLSXReportService, TAoaConfig } from '../../../../../service/xlsx-report/xlsx-report.service';
import { CALC_TYPE_LABEL, TIncomeEntry, TOrderConfirmationReportLine, TOrderContractDetail } from '../../../types/other-income.type';
import { COMP_TYPE_LABEL } from '../../../libs/settlement-labels';
import { ngbDateToIso, isoToNgbDate } from '../../../libs/date-time';
import { DatePickerComponent } from '../../../../../shared/components/date-picker/date-picker.component';

type TContractInfoRow = {
  label: string
  value: string
}

const contractInfoConfig: TAoaConfig<TContractInfoRow> = {
  sheetName: 'ข้อมูลสัญญา',
  config: [
    { header: 'รายการ', valueMapper: row => row.label },
    { header: 'ค่า', valueMapper: row => row.value },
  ],
}

function buildContractInfoRows(contract: TOrderContractDetail): TContractInfoRow[] {
  const rows: TContractInfoRow[] = [
    { label: 'ซัพพลายเออร์', value: `${contract.compCode} - ${contract.compName ?? '-'}` },
    { label: 'ประเภท', value: COMP_TYPE_LABEL[contract.compType] },
    { label: 'สัญญา', value: contract.contractLabelName },
    { label: 'รอบชำระ (เดือน)', value: String(contract.settlementPeriod) },
    { label: 'เริ่ม', value: contract.startDate?.slice(0, 10) ?? '' },
    { label: 'จบ', value: contract.endDate?.slice(0, 10) ?? '' },
    { label: 'วิธีคำนวณ', value: CALC_TYPE_LABEL[contract.spec.calcType] ?? contract.spec.calcType },
    { label: 'เพดานยอดซื้อ', value: contract.spec.capAmount != null ? String(contract.spec.capAmount) : '-' },
  ]
  for (const step of contract.steps) {
    rows.push({ label: `ขั้น ${step.min}${step.max != null ? ` - ${step.max}` : ' ขึ้นไป'}`, value: `${step.rate}%` })
  }
  for (const incomeType of contract.incomeTypes) {
    rows.push({ label: `ประเภทรายได้ (${incomeType.incomeType})`, value: incomeType.incomeLabelName ?? '-' })
  }
  return rows
}

const accrualEntryConfig: TAoaConfig<TIncomeEntry> = {
  sheetName: 'ประมาณการรายได้',
  config: [
    { header: 'เดือน', valueMapper: row => row.month?.slice(0, 7) ?? '' },
    { header: 'ประเภท', valueMapper: row => row.entryType },
    { header: 'ยอดสั่งซื้อ', valueMapper: row => row.orderAmount ?? '' },
    { header: 'จำนวนรายได้', valueMapper: row => row.amount },
    { header: 'หมายเหตุ', valueMapper: row => row.note ?? '' },
  ],
}

const orderConfirmationConfig: TAoaConfig<TOrderConfirmationReportLine> = {
  sheetName: 'รายการยืนยันยอด',
  config: [
    { header: 'เลข PO', valueMapper: row => row.orderNumb },
    { header: 'เลขรับสินค้า', valueMapper: row => row.receNumb },
    { header: 'วันที่รับสินค้า', valueMapper: row => row.receDate?.slice(0, 10) ?? '' },
    { header: 'เลขบิล', valueMapper: row => row.billNumb },
    { header: 'วันที่บิล', valueMapper: row => row.billDate?.slice(0, 10) ?? '' },
    { header: 'รหัสสินค้า', valueMapper: row => row.goodCode },
    { header: 'บาร์โค้ด', valueMapper: row => row.barCode ?? '' },
    { header: 'ชื่อสินค้า', valueMapper: row => row.goodName ?? '' },
    { header: 'ยอดเงิน', valueMapper: row => row.subtotal },
  ],
}

@Component({
  selector: 'app-order-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe, DatePickerComponent],
  templateUrl: './order-contract-layout.component.html',
  styles: '',
})
export class OrderContractLayoutComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly toast = inject(ToastService)
  private readonly api = inject(OtherIncomePurchaseApiService)
  private readonly xlsx = inject(XLSXReportService)
  private readonly calService = inject(NgbCalendar)
  readonly ctx = inject(OrderContractContextService)

  exportingConfirmation = signal(false)
  exportRangeFrom = signal<NgbDateStruct>(this.calService.getToday())
  exportRangeTo = signal<NgbDateStruct>(this.calService.getToday())

  constructor() {
    const routeParams = toSignal(this.route.params, { initialValue: this.route.snapshot.params })
    effect(() => {
      const raw = routeParams()['id']
      if (raw === undefined) return
      this.ctx.setId(+raw)
    })
    effect(() => {
      const contract = this.ctx.contract()
      if (!contract) return
      this.exportRangeFrom.set(isoToNgbDate(contract.startDate.slice(0, 10)))
      this.exportRangeTo.set(isoToNgbDate(contract.endDate.slice(0, 10)))
    })
  }

  goBack(): void {
    this.location.back();
  }

  onDeleteContract(): void {
    this.ctx.deleteContract().subscribe({
      next: () => {
        this.toast.success('ลบสัญญาเรียบร้อย')
        this.router.navigate(['../'], { relativeTo: this.route })
      },
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }

  onExportConfirmation(): void {
    const contract = this.ctx.contract()
    if (!contract) return
    this.exportingConfirmation.set(true)
    const receDateFrom = ngbDateToIso(this.exportRangeFrom())
    const receDateTo = ngbDateToIso(this.exportRangeTo())
    this.api.getOrderConfirmationReport(contract.id, { receDateFrom, receDateTo }).pipe(
      switchMap(report => this.xlsx.convertMultiSheetWorkbook([
        { config: contractInfoConfig, data: buildContractInfoRows(report.contract) },
        { config: accrualEntryConfig, data: this.ctx.incomeEntries() },
        { config: orderConfirmationConfig, data: report.lines },
      ]).pipe(
        switchMap(wb => this.xlsx.exportWorkbook(`Order Confirmation ${contract.compCode} ${new Date().toISOString().split('T')[0]}`)(wb))
      ))
    ).subscribe({
      next: () => this.exportingConfirmation.set(false),
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.exportingConfirmation.set(false)
      },
    })
  }
}
