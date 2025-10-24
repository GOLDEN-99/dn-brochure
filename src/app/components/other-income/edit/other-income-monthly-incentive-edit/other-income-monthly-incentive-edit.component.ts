import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MonthlyService } from '../../../../service/other-income/monthly.service';
import { TIncomeItem } from '../../../../service/other-income/base-oi';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateInputComponent } from "../../../date-input/date-input.component";

@Component({
  selector: 'app-other-income-monthly-incentive-edit',
  imports: [DecimalPipe, FormsModule, DateInputComponent],
  templateUrl: './other-income-monthly-incentive-edit.component.html',
  styleUrl: './other-income-monthly-incentive-edit.component.scss'
})
export class OtherIncomeMonthlyIncentiveEditComponent {
  incomeList = input.required<TIncomeItem[]>()
  success = output<string>()
  fail = output<string>()
  eventType = input.required<number>()

  id = input.required<number>()
  canEdit = input(false)

  private calServ = inject(NgbCalendar)
  private today = this.calServ.getToday()

  startDate = signal(this.today)
  endDate = signal(this.today)

  private modalService = inject(NgbModal)
  openModal(content: any) {
    this.modalService.open(content)
  }
  private monthService = inject(MonthlyService)
  date = this.monthService.date
  private _formatIso = (date: NgbDateStruct) => {
    const { year, month, day } = date
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  onMonthChange = this.monthService.updateDate('month')
  onYearChange = this.monthService.updateDate('year')

  incomeAmount = signal(0)
  reason = signal('')

  onSubmit() {
    const id = this.id()
    const startDate = this._formatIso(this.startDate())
    const endDate = this._formatIso(this.endDate())
    const reason = this.reason()
    const incomeAmount = this.incomeAmount()
    const eventType = this.eventType()
    this.monthService.insertNlMonth(id, { calAmount: 0, actualAmount: 0, startDate, endDate, reason, incomeAmount, receList: [], cn: 0, eventType }).subscribe({
      next: (res) => {
        this.success.emit('เพิ่มรับรู้รายเดือนสำเร็จ')
        this.modalService.dismissAll()
      },
      error: (err) => {
        this.fail.emit(err.message)
      }
    })
  }

  formatMonth(iso: string) {
    const [yy, mm, dd] = iso.split('T')[0].split('-')
    return `${mm}/${yy}`
  }

  onDelete(incId: number) {
    this.monthService.deleteMonthly(incId).subscribe({
      next: () => {
        this.success.emit('ลบสำเร็จ')
      },
      error: (err) => {
        this.fail.emit(err.message);
      }
    })
  }
}