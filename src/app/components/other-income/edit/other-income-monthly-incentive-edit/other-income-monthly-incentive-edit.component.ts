import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { NgbCalendar, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

  //renderList = computed(() => [...this.incomeList()].sort((a, b) => a.startDate.localeCompare(b.startDate)))

  success = output<string>()
  fail = output<string>()
  eventType = input.required<number>()

  id = input.required<number>()
  canEdit = input(false)
  headPeriod = input(0)
  productList = input<any[]>([])

  showCreateWithPeriod = computed(() =>
    this.canEdit()
    && this.headPeriod() === 1
    && this.productList().length === 0
  )

  private readonly calServ = inject(NgbCalendar)
  private readonly today = this.calServ.getToday()

  startDate = signal(this.today)
  endDate = signal(this.today)

  private readonly modalService = inject(NgbModal)
  openModal(content: any) {
    this.modalService.open(content)
  }
  private readonly monthService = inject(MonthlyService)
  date = this.monthService.date
  private readonly _formatIso = (date: NgbDateStruct) => {
    const { year, month, day } = date
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  onMonthChange = this.monthService.updateDate('month')
  onYearChange = this.monthService.updateDate('year')

  incomeAmount = signal(0)
  reason = signal('')

  // Create-with-period form signals
  cwpStartDate = signal(this.today)
  cwpIncomeAmount = signal(0)
  cwpPeriodName = signal('')
  cwpPeriodRemark = signal('')
  creatingWithPeriod = signal(false)

  openCreateWithPeriod(content: any) {
    this.modalService.open(content, { size: 'lg' })
  }

  onCreateWithPeriod() {
    const id = this.id()
    this.creatingWithPeriod.set(true)
    this.monthService.insertWithPeriod(id, {
      eventType: 3,
      incomeAmount: this.cwpIncomeAmount(),
      startDate: this._formatIso(this.cwpStartDate()),
      periodName: this.cwpPeriodName(),
      periodRemark: this.cwpPeriodRemark(),
    }).subscribe({
      next: () => {
        this.creatingWithPeriod.set(false)
        this.modalService.dismissAll()
        this.success.emit('สร้างและสรุปสำเร็จ')
      },
      error: (err) => {
        this.creatingWithPeriod.set(false)
        this.fail.emit(err?.message ?? String(err))
      }
    })
  }

  onSubmit() {
    const id = this.id()
    const startDate = this._formatIso(this.startDate())
    const endDate = this._formatIso(this.endDate())
    const reason = this.reason()
    const incomeAmount = this.incomeAmount()
    const eventType = this.eventType()
    this.monthService.insertNlMonth(id, { calAmount: 0, actualAmount: 0, startDate, endDate, reason, incomeAmount, receList: [], cn: 0, eventType }).subscribe({
      next: () => {
        this.success.emit('เพิ่มรับรู้รายเดือนสำเร็จ')
        this.modalService.dismissAll()
      },
      error: (err) => {
        this.fail.emit(err.message)
      }
    })
  }

  formatMonth(iso: string) {
    const [yy, mm] = iso.split('T')[0].split('-')
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

  selectedIncome = signal<TIncomeItem | null>(null)
  editMonth = computed(() => {
    const selected = this.selectedIncome()
    if (selected === null) return ''
    return this.formatMonth(selected.startDate)

  })
  editIncome = computed(() => this.selectedIncome()?.incomeAmount ?? 0)
  editReason = computed(() => this.selectedIncome()?.reason ?? '')

  updateIncome(incomeAmount: number) {
    this.selectedIncome.update(prev => prev === null ? prev : ({ ...prev, incomeAmount }))
  }

  updateReason(reason: string) {
    this.selectedIncome.update(prev => prev === null ? prev : ({ ...prev, reason }))
  }


  private readonly editMonthlyModal = viewChild('monthlyEditModal')

  onEdit(income: TIncomeItem) {
    this.selectedIncome.set(income)
    this.modalService
      .open(this.editMonthlyModal())
      .result
      .finally(() => this.selectedIncome.set(null))
  }

  onSaveEdit() {
    const income = this.selectedIncome()
    if (!income) return
    this.monthService.updateMonthly(income.id, {
      incomeAmount: income.incomeAmount,
      reason: income.reason,
    }).subscribe({
      next: () => {
        this.success.emit('แก้ไขสำเร็จ')
        this.modalService.dismissAll()
      },
      error: (err) => {
        this.fail.emit(err?.message ?? String(err))
      }
    })
  }
}