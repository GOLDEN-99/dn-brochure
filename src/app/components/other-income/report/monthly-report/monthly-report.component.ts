import { Component, inject, input, output } from '@angular/core';
import { NewReportService } from '../../../../service/other-income/new-report-service/new-report.service';

@Component({
  selector: 'app-monthly-report',
  imports: [],
  templateUrl: './monthly-report.component.html',
  styleUrl: './monthly-report.component.scss'
})
export class MonthlyReportComponent {
  month = input.required<string>();
  success = output<string>()
  fail = output<string>()
  loading = output<boolean>()

  private onFetch() {
    this.loading.emit(true)
  }

  private readonly onSuccess = () => {
    this.success.emit('สำเร็จ')
    this.loading.emit(false)
  }

  private readonly onFail = (err: any) => {
    if (err instanceof Error) {
      this.fail.emit(err.message)
    } else {
      this.fail.emit(String(err))
    }
    this.loading.emit(false)
  }

  private readonly reportService = inject(NewReportService)
  onExportDNDc() {
    this.onFetch()
    this.reportService.getDcRebateReport({ month: this.month(), compType: 'DN' })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail,
      })
  }
  onExportHUDc() {
    this.onFetch()
    this.reportService.getDcRebateReport({ month: this.month(), compType: 'HU' })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail,
      })
  }
  onExportDNLight() {
    this.onFetch()
    this.reportService.getLightBoxReport({ month: this.month(), compType: 'DN' }).subscribe({
      next: this.onSuccess,
      error: this.onFail
    })
  }
  onExportHULight() {
    this.onFetch()
    this.reportService.getLightBoxReport({ month: this.month(), compType: 'HU' }).subscribe({
      next: this.onSuccess,
      error: this.onFail
    })
  }
  onExportDNOther() {
    this.onFetch()
    this.reportService.getInceMonthReport({ month: this.month(), compType: 'DN' }).subscribe({
      next: this.onSuccess,
      error: this.onFail
    })
  }
  onExportHUOther() {
    this.onFetch()
    this.reportService.getInceMonthReport({ month: this.month(), compType: 'HU' }).subscribe({
      next: this.onSuccess,
      error: this.onFail
    })
  }
}
