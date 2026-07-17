import { Component, computed, inject, signal } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { MonthlyReportComponent } from "../../../../components/other-income/report/monthly-report/monthly-report.component";
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../service/toast/toast.service';
import { LoadingService } from '../../../../service/loading/loading.service';
import { ContractSummaryComponent } from "../../../../components/other-income/report/contract-summary/contract-summary.component";

@Component({
  selector: 'app-account-monthly-report',
  imports: [MonthlyReportComponent, FormsModule, ContractSummaryComponent],
  templateUrl: './account-monthly-report.component.html',
  styleUrl: './account-monthly-report.component.scss'
})
export class AccountMonthlyReportComponent {
  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()
  private readonly toastService = inject(ToastService)
  private readonly loadService = inject(LoadingService)

  onFetch(loading: boolean) {
    switch (loading) {
      case true:
        this.loadService.startLoad()
        break
      case false:
        this.loadService.endLoad()
        break
    }
  }

  onSuccess(msg: string) {
    this.toastService.success(msg)
  }

  onFail(msg: string) {
    this.toastService.danger(msg)
  }

  date = signal({
    day: this.today.day,
    month: this.today.month,
    year: this.today.year
  })
  month = signal(this.today.month)
  year = signal(this.today.year)
  fdom = computed(() => {
    const { year, month } = this.date()
    return `${year}-${String(month).padStart(2, "0")}-01`
  })
  fdoy = computed(() => {
    const { year } = this.date()
    return `${year}-01-01`
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
}
