import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MonthlyService } from '../../../../service/other-income/monthly.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { MonthSelectComponent } from "../../../date-input/month-select.component";
import { YearSelectComponent } from "../../../date-input/year-select.component";
import { DecimalPipe } from '@angular/common';
import { TOIStepItem } from '../../../../types';
import { TIncomeItem } from '../../../../service/other-income/base-oi';
import { calFlat, calSemi, calStep } from './lib';

@Component({
  selector: 'app-other-income-monthly-edit',
  imports: [FormsModule, MonthSelectComponent, YearSelectComponent, DecimalPipe],
  templateUrl: './other-income-monthly-edit.component.html',
  styleUrl: './other-income-monthly-edit.component.scss'
})
export class OtherIncomeMonthlyEditComponent {
  incomeList = input.required<TIncomeItem[]>()
  success = output<string>()
  fail = output<string>()

  isStep = input.required<boolean>()
  stepList = input.required<TOIStepItem[]>()
  calFunc = computed(() => {
    const isStep = this.isStep()
    const stepList = this.stepList()
    if (isStep) {
      return calStep(stepList)
    }
    if (stepList.length === 1) {
      return calFlat(stepList)
    }
    return calSemi(stepList)
  })
  accIncome = input.required<number>()
  accAmount = input.required<number>()
  capAmount = input.required<number | null>()
  calWithCap = computed(() => {
    const capAmount = this.capAmount()
    const accAmount = this.accAmount()
    const accIncome = this.accIncome()
    return this.calFunc()(capAmount, accAmount, accIncome)
  })

  compType = input.required<string | undefined>()
  id = input.required<number>()
  canEdit = input(false)

  private modalService = inject(NgbModal)
  openModal(content: any) {
    this.modalService.open(content)
  }
  private monthService = inject(MonthlyService)
  date = this.monthService.date
  isoDate = computed(() => {
    const { year, month, day } = this.date()
    return `${year}-${String(month).padStart(2, '0')}-01`
  })
  onMonthChange = this.monthService.updateDate('month')
  onYearChange = this.monthService.updateDate('year')
  calIncome = this.monthService.incomeList
  summary = computed(() => this.calIncome().reduce((acc, cur) => acc + cur.calAmount, 0))

  private queryReceipt = this.monthService.incomeList
  calAmount = computed(() => this.queryReceipt().reduce((acc, { calAmount }) => acc + calAmount, 0))
  actualAmount = signal(0)
  incomeAmount = computed(() => this.calWithCap()(this.actualAmount()))

  dif = computed(() => this.summary() - this.actualAmount())
  reason = signal('')
  cn = signal(0)

  onSearch() {
    const comp = this.compType()
    const id = this.id()
    if (comp !== 'DN' && comp !== 'HU') return
    this.monthService.calIncome(comp, id)
  }

  onSubmit() {
    const id = this.id()
    const createDate = this.isoDate()
    const reason = this.reason()
    const receList = this.calIncome().map(({ calAmount, receNumb }) => ({ calAmount, receNumb }))
    const calAmount = this.summary()
    const actualAmount = this.actualAmount()
    const incomeAmount = this.incomeAmount()
    this.monthService.insertNlMonth(id, { calAmount, actualAmount, createDate, reason, incomeAmount, receList }).subscribe({
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

type TCriteria = {
  isRebate: boolean
  isDc: boolean
  isComp: boolean
  isInce: boolean
  incVat: boolean
}
