import { Component, computed, inject } from '@angular/core';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeNotLightEditComponent } from "../../../../components/other-income/edit/other-income-not-light-edit/other-income-not-light-edit.component";
import { OtherIncomeProductEditComponent } from "../../../../components/other-income/edit/other-income-product-edit/other-income-product-edit.component";
import { FormsModule } from '@angular/forms';
import { OtherIncomeMonthlyEditComponent } from "../../../../components/other-income/edit/other-income-monthly-edit/other-income-monthly-edit.component";
import { CreatePeriodComponent } from "../../../../components/other-income/create/create-period/create-period.component";
import { OtherIncomeOrderPeriodComponent } from '../../../../components/other-income/period/other-income-order-period.component';
import { ToastService } from '../../../../service/toast/toast.service';
import { DecimalPipe } from '@angular/common';
import { OtherIncomeInvoicePeriodComponent } from '../../../../components/other-income/period/other-income-invoice-period.component';
import { OtherIncomeReciptPeriodComponent } from '../../../../components/other-income/period/other-income-recipt-period.component';
import { OtherIncomeGoodOrderPeriodComponent } from "../../../../components/other-income/period/other-income-good-order-period.component";
import { TPopulatedPeriodResult } from '../../../../service/other-income/base-oi';
import { OtherIncomeMonthlyIncentiveEditComponent } from "../../../../components/other-income/edit/other-income-monthly-incentive-edit/other-income-monthly-incentive-edit.component";
import { OtherIncomeCreditPeriodComponent } from "../../../../components/other-income/period/other-income-credit-period.component";

@Component({
  selector: 'app-not-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeNotLightEditComponent,
    OtherIncomeMonthlyEditComponent, OtherIncomeProductEditComponent,
    OtherIncomeMonthlyEditComponent, CreatePeriodComponent,
    OtherIncomeOrderPeriodComponent,
    OtherIncomeReciptPeriodComponent, OtherIncomeInvoicePeriodComponent,
    NgbDatepickerModule, FormsModule, DecimalPipe,
    OtherIncomeGoodOrderPeriodComponent,
    OtherIncomeMonthlyIncentiveEditComponent,
    OtherIncomeCreditPeriodComponent
  ],
  templateUrl: './not-light-single.component.html',
  styleUrl: './not-light-single.component.scss'
})
export class NotLightSingleComponent {
  private toastService = inject(ToastService)

  private notLightServ = inject(OiNotLightService)
  data = this.notLightServ.singleRecord
  invalidValue = computed(() => this.data().length !== 1)
  currentResult = computed(() => this.data()[0])

  acc = computed(() => {
    const { head: { accAmount, accIncome } } = this.currentResult()
    return { accAmount, accIncome }
  })
  incomeList = computed(() => this.currentResult().incomeList)

  criteria = computed(() => {
    const { notLight } = this.currentResult()
    if (!notLight) return null
    const { isComp, isDc, isInce, incVat, isRebate } = notLight
    return { isDc, isRebate, isComp, isInce, incVat }
  })

  periodList = computed(() => this.currentResult().periodList)

  onSuccess(value: string) {
    this.toastService.success(value);
    this.notLightServ.refetch();
  }

  onFail(value: string) {
    this.toastService.danger(value);
  }

  periodOrderSelector: TFieldSelector<TPopulatedPeriodResult>[] = [
    { label: 'ชื่อ', fn: v => v.periodName },
    { label: 'ยอดซื้อ', fn: v => this._localFormatNumber(v.totalAmount) },
    { label: 'รายได้', fn: v => this._localFormatNumber(v.totalIncome) },
    { label: 'ยอด po', fn: v => this._localFormatNumber(v.orderAmount) }
  ]

  periodReceSelector: TFieldSelector<TPopulatedPeriodResult>[] = [
    { label: 'ชื่อ', fn: v => v.periodName },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้', fn: v => v.totalIncome },
    { label: 'ยอดใบแจ้งหนี้', fn: v => v.invAmount },
    { label: 'ยอดใบเสร็จ', fn: v => v.receAmount },
  ]

  periodCreditSelector: TFieldSelector<TPopulatedPeriodResult>[] = [
    { label: 'ชื่อ', fn: v => v.periodName },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้', fn: v => v.totalIncome },
    { label: 'ยอดใบลดหนี้', fn: v => v.invAmount },
  ]

  genPeriodHeader = (eventType: number) => {
    switch (eventType) {
      case 1:
        return this.periodOrderSelector.map(({ label }) => label)
      case 2:
        return this.periodReceSelector.map(({ label }) => label)
      case 3:
        return this.periodCreditSelector.map(({ label }) => label)
      default: return []
    }
  }

  formatPeriodValue = (eventType: number) => (value: TPopulatedPeriodResult) => {
    switch (eventType) {
      case 1:
        return this.periodOrderSelector.map(({ fn }) => fn(value))
      case 2:
        return this.periodReceSelector.map(({ fn }) => fn(value))
      case 3:
        return this.periodCreditSelector.map(({ fn }) => fn(value))
      default: return []
    }
  }

  private _localFormatNumber = (value: number) => value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
type TObj = Record<string, unknown>
type TSelectFn<T extends TObj> = (v: T) => T[keyof T]
type TFieldSelector<T extends TObj> = { label: string, fn: TSelectFn<T> }