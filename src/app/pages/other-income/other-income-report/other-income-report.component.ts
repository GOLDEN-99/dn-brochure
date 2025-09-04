import { Component, computed, inject, input, signal } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { SupplierReportService } from '../../../service/other-income/supplier-report.service';
import { FormsModule } from '@angular/forms';
import { OtherIncomeOrderReportComponent } from "../../../components/other-income/report/other-income-order-report/other-income-order-report.component";
import { OiAccountReportService } from '../../../service/other-income/oi-account-report.service';

@Component({
  selector: 'app-other-income-report',
  imports: [FormsModule, OtherIncomeOrderReportComponent],
  templateUrl: './other-income-report.component.html',
  styleUrl: './other-income-report.component.scss'
})
export class OtherIncomeReportComponent {
  private calServ = inject(NgbCalendar)
  private today = this.calServ.getToday()
  compCode = signal("")
  date = signal({
    day: this.today.day,
    month: this.today.month,
    year: this.today.year
  })

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
  exportDnInvoice() {
    this.accReport.exportInvoiceReport(1)
  }
  exportHuInvoice() {
    this.accReport.exportInvoiceReport(2)
  }
  exportAnnualDN() {
    const date = this.date()
    const compCode = this.compCode()
    const compType = 'DN'
    this.compType.set('DN')
    this.reportServ.fetchYear(date, compCode, compType)
  }
  exportAnnualHU() {
    const date = this.date()
    const compCode = this.compCode()
    const compType = 'HU'
    this.compType.set('HU')
    this.reportServ.fetchYear(date, compCode, compType)
  }

  async toAnnualExcel() {
    await this.reportServ.annualExport();
  }
}
