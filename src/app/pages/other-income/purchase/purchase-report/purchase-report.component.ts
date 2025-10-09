import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { SupplierReportService } from '../../../../service/other-income/supplier-report.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { LoadingService } from '../../../../service/loading/loading.service';

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

  private toast = inject(ToastService)
  private loading = inject(LoadingService)
  exportSupplierMonth(compType: number) {
    const compCode = this.compCode()
    console.log(compCode)
    const { month, year } = this.date()
    this.loading.startLoad()
    this.reportServ.exportSupplierMonthReport(compType, compCode, { year, month, day: 1 })
      .subscribe({
        next: async (res) => {
          if (res.length === 0) {
            this.toast.danger('ไม่มีข้อมูล')
            this.loading.endLoad()
            return
          }
          await this.reportServ.exportManySheet(res)
          this.toast.success('สำเร็จ')
          this.loading.endLoad()
        }, error: (err) => {
          this.toast.danger(err);
          this.loading.endLoad();
        }
      })
  }

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
}
