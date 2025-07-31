import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { SupplierReportService } from '../../../../service/other-income/supplier-report.service';

@Component({
  selector: 'app-purchase-report',
  imports: [FormsModule],
  templateUrl: './purchase-report.component.html',
  styleUrl: './purchase-report.component.scss'
})
export class PurchaseReportComponent {
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
  monthDis = this.reportServ.displayMonth
  yearDis = this.reportServ.displayYear
  exportMonthDN() {
    const date = this.date()
    const compCode = this.compCode()
    const compType = 'DN'
    this.compType.set('DN')
    this.reportServ.fetchMonth(date, compCode, compType)
  }
  exportMonthHU() {
    const date = this.date()
    const compCode = this.compCode()
    const compType = 'HU'
    this.compType.set('HU')
    this.reportServ.fetchMonth(date, compCode, compType)
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
  async toExcel() {
    await this.reportServ.exportTo()
  }

  async toAnnualExcel() {
    await this.reportServ.annualExport();
  }
}
