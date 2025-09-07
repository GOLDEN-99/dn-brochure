import { Component, computed, inject, input, signal } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { SupplierReportService } from '../../../service/other-income/supplier-report.service';
import { FormsModule } from '@angular/forms';
import { OtherIncomeOrderReportComponent } from "../../../components/other-income/report/other-income-order-report/other-income-order-report.component";
import { OiAccountReportService } from '../../../service/other-income/oi-account-report.service';
import { ToastService } from '../../../service/toast/toast.service';
import * as XLSX from "xlsx"
import { convertToIso } from '../../../lib';
import { LoadingService } from '../../../service/loading/loading.service';
import { toXlxs } from '../../../lib/utli';

@Component({
  selector: 'app-other-income-report',
  imports: [FormsModule, OtherIncomeOrderReportComponent],
  templateUrl: './other-income-report.component.html',
  styleUrl: './other-income-report.component.scss'
})
export class OtherIncomeReportComponent {
  private calServ = inject(NgbCalendar)
  private today = this.calServ.getToday()
  private toast = inject(ToastService)
  private loading = inject(LoadingService)
  compCode = signal("")
  date = signal({
    day: this.today.day,
    month: this.today.month,
    year: this.today.year
  })
  private _iso = convertToIso(this.today)
  private _invName = `รายงานออกใบแจ้งหนี้วันที่-${this._iso}.xlsx`
  private _invSheet = 'รอออกใบแจ้งหนี้'
  private _receName = `รายงานออกใบเสร็จวันที่-${this._iso}.xlsx`
  private _receSheet = 'รอออกใบเสร็จ'
  private _lightName = `รายงาน lightBox-${this._iso}.xlsx`
  private _lightSheet = 'lightBox'
  monthArray = Array.from({ length: 12 }).map((_, i) => i + 1)

  changeMonth(month: number) {
    this.date.update(prev => ({ ...prev, month }))
  }
  yearArray = Array
    .from({ length: 10 })
    .map((_, i) => this.today.year - 5 + i)

  changeYear(year: number) {
    this.date.update(prev => ({ ...prev, year }))
  }
  compType = signal("")
  disable1 = computed(() => !this.compCode())
  private reportServ = inject(SupplierReportService)
  yearDis = this.reportServ.displayYear
  private accReport = inject(OiAccountReportService)
  exportInvoice(compType: number) {
    this.loading.startLoad()
    this.accReport.exportInvoiceReport(compType).subscribe({
      next: async res => await this.toXlsx(this._invName, this._invSheet, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }
  exportRece(compType: number) {
    this.loading.startLoad()
    this.accReport.exportReceiptReport(compType).subscribe({
      next: async res => await this.toXlsx(this._receName, this._receSheet, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }
  exportLight(compType: number) {
    this.loading.startLoad()
    this.accReport.exportLightReport(compType, this.date()).subscribe({
      next: async res => await this.toXlsx(this._lightName, this._lightSheet, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }
  exportAnnualIncomeReport(compType: number) {
    this.loading.startLoad()
    const d = this.date()
    this.accReport.exportAnnualIncomeReport(compType, d).subscribe({
      next: async res => await this.toXlsx(`รายได้อื่นๆประจำปี${d.year}.xlsx`, `${d.year}`, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }
  exportMonthBuy(compType: number) {
    this.loading.startLoad()
    const d = this.date()
    this.accReport.exportMonthbuyReport(compType, d).subscribe({
      next: async res => await this.toXlsx(`รายการซื้อเดือน-${d.month}-${d.year}.xlsx`, `${d.month}-${d.year}`, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }

  exportMonthInce(compType: number) {
    this.loading.startLoad()
    const d = this.date()
    this.accReport.exportInceReport(compType, d).subscribe({
      next: async res => await this.toXlsx(`รายการรายได้อื่นๆอื่นๆ-${d.month}-${d.year}.xlsx`, `${d.month}-${d.year}`, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }
  exportAnnualDN() {
    this.loading.startLoad()
    const date = this.date()
    const compCode = this.compCode()
    const compType = 'DN'
    this.compType.set('DN')
    this.reportServ.fetchYear(date, compCode, compType)
  }
  exportAnnualHU() {
    this.loading.startLoad()
    const date = this.date()
    const compCode = this.compCode()
    const compType = 'HU'
    this.compType.set('HU')
    this.reportServ.fetchYear(date, compCode, compType)
  }

  async toAnnualExcel() {
    this.loading.startLoad()
    await this.reportServ.annualExport();
  }

  private toXlsx = toXlxs
}
