import { Component, computed, inject, input } from '@angular/core';
import { TIncomeItem } from '../../../../service/other-income/base-oi';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { MonthlyService } from '../../../../service/other-income/monthly.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { DecimalPipe } from '@angular/common';
import { MonthSelectComponent } from "../../../date-input/month-select.component";
import { YearSelectComponent } from "../../../date-input/year-select.component";

@Component({
  selector: 'app-other-income-monthly-light-edit',
  imports: [DecimalPipe, MonthSelectComponent, YearSelectComponent],
  templateUrl: './other-income-monthly-light-edit.component.html',
  styleUrl: './other-income-monthly-light-edit.component.scss'
})
export class OtherIncomeMonthlyLightEditComponent {
  incomeList = input.required<TIncomeItem[]>()
  id = input.required<number>()

  private modalService = inject(NgbModal)
  openModal(content: any) {
    this.modalService.open(content)
  }
  private lightServ = inject(OiLightService)
  private monthService = inject(MonthlyService)
  date = this.monthService.date
  isoDate = computed(() => {
    const { year, month, day } = this.date()
    return `${year}-${String(month).padStart(2, '0')}-01`
  })
  onMonthChange = this.monthService.updateDate('month')
  onYearChange = this.monthService.updateDate('year')

  private toast = inject(ToastService)

  onSubmit() {
    const id = this.id()
    const createDate = this.isoDate()
    this.monthService.insertLMonth(id, createDate).subscribe({
      next: (res) => {
        console.log(res.purchasingId)
        this.toast.success('เพิ่มรับรู้รายเดือนสำเร็จ')
        this.modalService.dismissAll()
        this.lightServ.refetch()
      },
      error: (err) => {
        this.toast.danger(err.message)
      }
    })
  }

  onDelete(id: number) {
    this.monthService.deleteMonthly(id).subscribe({
      next: () => {
        this.toast.success('ลบสำเร็จ');
        this.lightServ.refetch();
      },
      error: (err) => {
        this.toast.danger(err.message);
      }
    })
  }

  formatMonth(iso: string) {
    const [yy, mm, dd] = iso.split('T')[0].split('-')
    return `${mm}/${yy}`
  }

}
