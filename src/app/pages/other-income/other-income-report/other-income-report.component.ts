import { Component, computed, inject, signal } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { SupplierReportService } from '../../../service/other-income/supplier-report.service';
import { FormsModule } from '@angular/forms';
import { OiAccountReportService } from '../../../service/other-income/oi-account-report.service';
import { ToastService } from '../../../service/toast/toast.service';
import { convertToIso } from '../../../lib';
import { LoadingService } from '../../../service/loading/loading.service';
import { toXlxs } from '../../../lib/utli';
import { DateInputComponent } from "../../../components/date-input/date-input.component";
import { AccountIssuingDocumentReportComponent } from "../../../components/other-income/report/account-issuing-document-report/account-issuing-document-report.component";

@Component({
  selector: 'app-other-income-report',
  imports: [FormsModule, DateInputComponent, AccountIssuingDocumentReportComponent],
  templateUrl: './other-income-report.component.html',
  styleUrl: './other-income-report.component.scss'
})
export class OtherIncomeReportComponent {
  private readonly calServ = inject(NgbCalendar)
  private readonly today = this.calServ.getToday()
  private readonly toast = inject(ToastService)
  private readonly loading = inject(LoadingService)
  compCode = signal("")
  date = signal({
    day: this.today.day,
    month: this.today.month,
    year: this.today.year
  })
  endDate = signal({
    day: this.today.day,
    month: this.today.month,
    year: this.today.year + 1
  })

  fdom = computed(() => {
    const { month, year } = this.date()
    return `${year}-${String(month).padStart(2, '0')}-01`
  })


  private readonly _iso = convertToIso(this.today)
  private readonly _invName = `รายงานออกใบแจ้งหนี้วันที่-${this._iso}.xlsx`
  private readonly _invSheet = 'รอออกใบแจ้งหนี้'
  private readonly _creditName = `รายงานออกใบลดหนี้วันที่-${this._iso}.xlsx`
  private readonly _creditSheet = 'รอออกใบลดหนี้'
  private readonly _receName = `รายงานออกใบเสร็จวันที่-${this._iso}.xlsx`
  private readonly _receSheet = 'รอออกใบเสร็จ'
  private readonly _lightName = `รายงาน lightBox-${this._iso}.xlsx`
  private readonly _lightSheet = 'lightBox'
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
  private readonly reportServ = inject(SupplierReportService)
  yearDis = this.reportServ.displayYear
  private readonly accReport = inject(OiAccountReportService)
  exportInvoice(compType: number) {
    this.loading.startLoad()
    this.accReport.exportInvoiceReport(compType, 'invoice').subscribe({
      next: async res => await this.toXlsx(this._invName, this._invSheet, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }

  exportCredit(compType: number) {
    this.loading.startLoad()
    this.accReport.exportInvoiceReport(compType, 'credit').subscribe({
      next: async res => await this.toXlsx(this._creditName, this._creditSheet, res),
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

  exportRangeBill(compType: number) {
    this.loading.startLoad()
    const start = this.date()
    const end = this.endDate()
    this.accReport.exportBillReport(compType, start, end).subscribe({
      next: async res => await this.toXlsx(`รายการส่วนลดท้ายบิล_${start.month}-${start.year}_${end.month}-${end.year}.xlsx`, `${start.month}-${start.year} ถึง ${end.month}-${end.year}`, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }
  exportRangeProduct(compType: number) {
    this.loading.startLoad()
    const start = this.date()
    const end = this.endDate()
    this.accReport.exportProductReport(compType, start, end).subscribe({
      next: async res => await this.toXlsx(`รายการสินค้า_${start.month}-${start.year}_${end.month}-${end.year}.xlsx`, `${start.month}-${start.year} ถึง ${end.month}-${end.year}`, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }
  exportRangeInvRece(compType: number) {
    this.loading.startLoad()
    const start = this.date()
    const end = this.endDate()
    this.accReport.exportInvReceReport(compType, start, end).subscribe({
      next: async res => await this.toXlsx(`รายการใบแจ้งหนี้_${start.month}-${start.year}_${end.month}-${end.year}.xlsx`, `${start.month}-${start.year} ถึง ${end.month}-${end.year}`, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }
  exportRangeCredit(compType: number) {
    this.loading.startLoad()
    const start = this.date()
    const end = this.endDate()
    this.accReport.exportCreditReport(compType, start, end).subscribe({
      next: async res => await this.toXlsx(`รายการใบลดหนี้_${start.month}-${start.year}_${end.month}-${end.year}.xlsx`, `${start.month}-${start.year} ถึง ${end.month}-${end.year}`, res),
      error: (err) => this.toast.danger(err?.message),
      complete: () => this.loading.endLoad()
    })
  }

  private readonly toXlsx = toXlxs

  exportSupplierAnnual(compType: number) {
    const compCode = this.compCode()
    const { year } = this.date()
    this.loading.startLoad()
    this.reportServ.exportSupplierAnnualReport(compType, compCode, { year, month: 1, day: 1 })
      .subscribe({
        next: async (res) => {
          if (res.length === 0) {
            this.toast.danger('ไม่มีข้อมูล')
            this.loading.endLoad()
            return
          }
          const date = new Date()
          const fileName = date.getDate() + '-annual'
          await this.reportServ.exportManySheet(res, fileName)
          this.toast.success('สำเร็จ')
          this.loading.endLoad()
        }, error: (err) => {
          this.toast.danger(err);
          this.loading.endLoad();
        }
      })
  }

  exportSupplierMonthDetial(compType: number) {
    const compCode = this.compCode()
    const { month, year } = this.date()
    this.loading.startLoad()
    this.reportServ
      .exportSupplierMonthDetialReport(compType, compCode, { year, month, day: 1 })
      .subscribe({
        next: async (res) => {
          if (res.length === 0) {
            this.toast.danger('ไม่มีข้อมูล')
            this.loading.endLoad()
            return
          }
          await this.reportServ.exportManySheet(res,)
          this.toast.success('สำเร็จ')
          this.loading.endLoad()
        }, error: (err) => {
          this.toast.danger(err);
          this.loading.endLoad();
        }
      })
  }


  onLoading(loading: boolean) {
    if (loading) {
      this.loading.startLoad()
      return
    }
    this.loading.endLoad();
  }


  onSuccess(msg: string) {
    this.toast.success(msg)
  }

  onError(err: string) {
    this.toast.danger(err)
  }
}
