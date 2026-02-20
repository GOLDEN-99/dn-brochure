import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MonthlyService } from '../../../../service/other-income/monthly.service';
import { MonthSelectComponent } from "../../../date-input/month-select.component";
import { YearSelectComponent } from "../../../date-input/year-select.component";
import { DecimalPipe } from '@angular/common';
import { TOIStepItem } from '../../../../types';
import { calFlat, calSemi, calStep } from './lib';
import { formatLocalNumber } from '../../../../lib/formatter';
import { OiNotLightListService } from '../../../../service/other-income/oi-not-light-list.service';

@Component({
  selector: 'app-other-income-monthly-edit',
  imports: [FormsModule, MonthSelectComponent, YearSelectComponent, DecimalPipe],
  templateUrl: './other-income-monthly-edit.component.html',
  styleUrl: './other-income-monthly-edit.component.scss'
})
export class OtherIncomeMonthlyEditComponent {

  success = output<string>()
  fail = output<string>()

  eventType = input.required<number>()
  stepType = input.required<number>()
  stepList = input.required<TOIStepItem[]>()
  accIncome = input.required<number>()
  accAmount = input.required<number>()
  capAmount = input.required<number | null>()
  compType = input<string | undefined>()
  id = input.required<number>()
  canEdit = input(false)

  calFunc = computed(() => {
    const steps = this.stepList()
    switch (this.stepType()) {
      case 1: return calFlat(steps)
      case 2: return calSemi(steps)
      default: return calStep(steps)
    }
  })
  calWithCap = computed(() => {
    const capAmount = this.capAmount()
    const accAmount = this.accAmount()
    const accIncome = this.accIncome()
    return this.calFunc()(capAmount, accAmount, accIncome)
  })

  private readonly modalService = inject(NgbModal)
  openModal(content: any) {
    const modalRef = this.modalService.open(content)
    modalRef.result.finally(() => {
      this.monthService.cleanup()
      this.resetForm()
    })
  }

  private readonly monthService = inject(MonthlyService)
  date = this.monthService.date
  isoDate = computed(() => {
    const { year, month } = this.date()
    return `${year}-${String(month).padStart(2, '0')}-01`
  })
  onMonthChange = this.monthService.updateDate('month')
  onYearChange = this.monthService.updateDate('year')
  calIncome = this.monthService.incomeList
  summary = computed(() => this.calIncome().reduce((acc, cur) => acc + cur.calAmount, 0))

  // CN amount — manual input, resets to 0 on form reset
  rawCnAmount = signal('0.00') // string cn amount for display and edit
  cn = computed(
    () => Number.parseFloat(this.rawCnAmount().replaceAll(',', ''))
  ) // number cn for calculation

  // Total amount — read-only, derived from fetched data
  rawTotalAmount = linkedSignal(() => formatLocalNumber(this.summary()))

  // Actual amount — defaults to summary - cn, user can override manually
  rawActualAmount = linkedSignal(
    () => formatLocalNumber(this.summary() - this.cn())
  ) //string for edit and display

  actualAmount = computed(
    () => Number.parseFloat(this.rawActualAmount().replaceAll(',', ''))
  ) // number for api call and calculation

  incomeAmount = computed(
    () => this.calWithCap()(this.actualAmount())
  ) // number result of actualAmount -> calWithCap

  reason = signal('')
  disableOnclick = signal(false)

  onSearch() {
    const comp = this.compType()
    const id = this.id()
    if (comp !== 'DN' && comp !== 'HU') return
    this.monthService.calIncome(comp, id)
  }

  private readonly notLightList = inject(OiNotLightListService)

  onSubmit() {
    if (this.disableOnclick()) return
    this.disableOnclick.set(true)
    const id = this.id()
    const startDate = this.isoDate()
    const reason = this.reason()
    const receList = this.calIncome()
      .map(({ calAmount, receNumb }) => ({ calAmount, receNumb }))
    const calAmount = this.summary()
    const actualAmount = this.actualAmount()
    const incomeAmount = this.incomeAmount()
    const cn = this.cn()
    const eventType = this.eventType()
    // api call
    this.monthService
      .insertNlMonth(id, {
        calAmount, actualAmount, startDate,
        reason, incomeAmount, receList,
        cn, eventType
      }).subscribe({
        next: () => {
          this.success.emit('เพิ่มรับรู้รายเดือนสำเร็จ')
          this.notLightList.refetch()
          this.modalService.dismissAll()
        },
        error: (err) => {
          this.fail.emit(err.message)
          this.disableOnclick.set(false)
        }
      })
  }

  resetForm() {
    this.rawCnAmount.set('0.00')
    this.reason.set('')
    this.disableOnclick.set(false)
  }
}