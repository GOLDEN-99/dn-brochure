import { Component, inject, output } from '@angular/core';
import { NewReportService } from '../../../../service/other-income/new-report-service/new-report.service';

@Component({
  selector: 'app-purchase-append-order-report',
  imports: [],
  templateUrl: './purchase-append-order-report.component.html',
  styleUrl: './purchase-append-order-report.component.scss'
})
export class PurchaseAppendOrderReportComponent {
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

  onExportBillOrder(compType: string) {
    this.onFetch()
    this.newReport.getIssueBillDiscount({ compType })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail
      })
  }

  onExportFreeProduct(compType: string) {
    this.onFetch()
    this.newReport.getIssueFreeProduct({ compType })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail
      })
  }
}
