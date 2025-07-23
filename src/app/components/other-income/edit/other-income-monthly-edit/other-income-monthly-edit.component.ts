import { Component, computed, inject, input, signal } from '@angular/core';
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
    return this.calFunc()(capAmount)
  })

  compType = input.required<string | undefined>()
  id = input.required<number>()
  canEdit = input(false)

  private modalService = inject(NgbModal)
  openModal(content: any) {
    this.modalService.open(content)
  }
  private notLightServ = inject(OiNotLightService)
  private monthService = inject(MonthlyService)
  date = this.monthService.date
  isoDate = computed(() => {
    const { year, month, day } = this.date()
    return `${year}-${String(month).padStart(2, '0')}-01`
  })
  onMonthChange = this.monthService.updateDate('month')
  onYearChange = this.monthService.updateDate('year')
  incomeList2 = this.monthService.incomeList2
  summary = computed(() => this.mod2().reduce((acc, cur) =>
  ({
    actualAmount: acc.actualAmount + cur.actualAmount,
    calAmount: acc.calAmount + cur.calAmount,
    incomeAmount: acc.incomeAmount + cur.income
  }),
    { actualAmount: 0, calAmount: 0, incomeAmount: 0 }))
  private amoMap = new Map<number, number>()
  private incMap = new Map<number, number>()
  mod2 = computed(() => {
    const lst = this.incomeList2()
    const accAmount = this.accAmount()
    const accIncome = this.accIncome()
    this.amoMap.set(0, accAmount)
    this.incMap.set(0, accIncome)
    const fn = this.calWithCap()
    return lst.map((l, i) => {
      const saveInc = this.incMap.get(i)
      const saveAmo = this.amoMap.get(i)
      if (typeof saveInc === 'number' && typeof saveAmo === 'number') {
        const curInc = fn(saveAmo, saveInc, l.actualAmount)
        this.incMap.set(i + 1, curInc + saveInc)
        this.amoMap.set(i + 1, l.actualAmount + saveAmo)
        return { ...l, income: curInc }
      }
      throw new Error('error on compute income')
    })
  })
  updateList2 = this.monthService.updateActual
  private queryReceipt = this.monthService.incomeList
  calAmount = computed(() => this.queryReceipt().reduce((acc, { calAmount }) => acc + calAmount, 0))
  actualAmount = signal(0)
  dif = computed(() => {
    const { calAmount, actualAmount } = this.summary()
    return calAmount - actualAmount
  })
  reason = signal('')

  onSearch() {
    const comp = this.compType()
    const id = this.id()
    if (comp !== 'DN' && comp !== 'HU') return
    this.monthService.calIncome(comp, id)
  }

  private toast = inject(ToastService)

  onSubmit() {
    const id = this.id()
    const createDate = this.isoDate()
    const reason = this.reason()
    const { calAmount, actualAmount, incomeAmount } = this.summary()
    const receList = this.mod2()
    this.monthService.insertNlMonth(id, { calAmount, actualAmount, createDate, reason, incomeAmount, receList }).subscribe({
      next: (res) => {
        this.toast.success('เพิ่มรับรู้รายเดือนสำเร็จ')
        this.modalService.dismissAll()
        this.notLightServ.refetch()
      },
      error: (err) => {
        this.toast.danger(err.message)
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
        this.toast.success('ลบสำเร็จ')
        this.notLightServ.refetch()
      },
      error: (err) => {
        this.toast.danger(err.message);
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
