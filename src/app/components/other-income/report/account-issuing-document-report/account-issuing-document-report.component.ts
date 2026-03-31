import { Component, inject, output } from '@angular/core';
import { NewReportService } from '../../../../service/other-income/new-report-service/new-report.service';

@Component({
  selector: 'app-account-issuing-document-report',
  imports: [],
  templateUrl: './account-issuing-document-report.component.html',
  styleUrl: './account-issuing-document-report.component.scss'
})
export class AccountIssuingDocumentReportComponent {
  success = output<string>()
  loading = output<boolean>()
  fail = output<string>()

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

  private readonly newReport = inject(NewReportService)

  exportInvoice(compType: string) {
    this.onFetch()
    this.newReport.getIssueInvocie({ compType })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail
      })
  }

  exportCredit(compType: string) {
    this.onFetch()
    this.newReport.getIssueCredit({ compType })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail
      })
  }

  exportReceipt(compType: string) {
    this.onFetch()
    this.newReport.getIssueReceipt({ compType })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail
      })
  }

}
