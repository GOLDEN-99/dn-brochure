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
import { OtherIncomeInvoicePeriodComponent } from '../../../../components/other-income/period/other-income-invoice-period.component';
import { OtherIncomeReciptPeriodComponent } from '../../../../components/other-income/period/other-income-recipt-period.component';
import { OtherIncomeGoodOrderPeriodComponent } from "../../../../components/other-income/period/other-income-good-order-period.component";
import { TPopulatedPeriodResult } from '../../../../service/other-income/base-oi';
import { OtherIncomeMonthlyIncentiveEditComponent } from "../../../../components/other-income/edit/other-income-monthly-incentive-edit/other-income-monthly-incentive-edit.component";
import { OtherIncomeCreditPeriodComponent } from "../../../../components/other-income/period/other-income-credit-period.component";
import { OtherIncomeMonthlyListComponent } from "../../../../components/other-income/template/other-income-monthly-list.component";
import { formatLocalNumber } from '../../../../lib/formatter';
import { TFieldSelector } from '../../../../types';
import { OTHER_INCOME_PAGE_TOKEN } from '../../../../lib';

@Component({
  selector: 'app-not-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeNotLightEditComponent,
    OtherIncomeMonthlyEditComponent, OtherIncomeProductEditComponent,
    OtherIncomeMonthlyEditComponent, CreatePeriodComponent,
    OtherIncomeOrderPeriodComponent,
    OtherIncomeReciptPeriodComponent, OtherIncomeInvoicePeriodComponent,
    NgbDatepickerModule, FormsModule,
    OtherIncomeGoodOrderPeriodComponent,
    OtherIncomeMonthlyIncentiveEditComponent,
    OtherIncomeCreditPeriodComponent,
    OtherIncomeMonthlyListComponent
  ],
  templateUrl: './not-light-single.component.html',
  styleUrl: './not-light-single.component.scss'
})
export class NotLightSingleComponent {
  private toastService = inject(ToastService)
  private _pageToken = inject(OTHER_INCOME_PAGE_TOKEN)
  isPurchase = this._pageToken.isPurchase
  private notLightServ = inject(OiNotLightService)
  data = this.notLightServ.singleRecord
  invalidValue = computed(() => this.data().length !== 1)
  currentResult = computed(() => this.data()[0])

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
    { label: 'ยอดซื้อ', fn: v => this._localFormatNumber(v.totalAmount) },
    { label: 'รายได้', fn: v => this._localFormatNumber(v.totalIncome) },
    { label: 'ยอดใบแจ้งหนี้', fn: v => this._localFormatNumber(v.invAmount) },
    { label: 'ยอดใบเสร็จ', fn: v => this._localFormatNumber(v.receAmount) },
  ]

  periodCreditSelector: TFieldSelector<TPopulatedPeriodResult>[] = [
    { label: 'ชื่อ', fn: v => v.periodName },
    { label: 'ยอดซื้อ', fn: v => this._localFormatNumber(v.totalAmount) },
    { label: 'รายได้', fn: v => this._localFormatNumber(v.totalIncome) },
    { label: 'ยอดใบลดหนี้', fn: v => this._localFormatNumber(v.creditAmount) },
  ]

  private _genSelector = (incomeType: number) => {
    console.log(incomeType)
    switch (incomeType) {
      case 1:
        return this.periodOrderSelector
      case 2:
        return this.periodOrderSelector
      case 3:
        return this.periodReceSelector
      case 4:
        return this.periodCreditSelector
      default: return []
    }
  }

  private _currentSelector = computed(() => this._genSelector(this.currentResult().income.incomeType))
  currentHeader = computed(() => this._currentSelector().map(({ label }) => label))
  currentMapper = computed(() => this._currentSelector().map(({ fn }) => fn))

  private _localFormatNumber = formatLocalNumber
}