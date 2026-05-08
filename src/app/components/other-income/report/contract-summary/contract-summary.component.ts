import { Component, inject, input, output } from '@angular/core';
import { NewReportService } from '../../../../service/other-income/new-report-service/new-report.service';
import { TCompType } from '../../../../types';

@Component({
  selector: 'app-contract-summary',
  imports: [],
  templateUrl: './contract-summary.component.html',
  styleUrl: './contract-summary.component.scss'
})
export class ContractSummaryComponent {
  year = input.required<string>()
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

  private readonly reportService = inject(NewReportService)


  onExportContract(compType: TCompType) {
    this.onFetch()
    this.reportService
      .getContractReport({ year: this.year(), compType })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail,
      })
  }

  onCheckDifference(compType: TCompType) {
    this.onFetch()
    this.reportService
      .getPeriodDualDate({ compType })
      .subscribe({
        next: this.onSuccess,
        error: this.onFail,
      })
  }
}
