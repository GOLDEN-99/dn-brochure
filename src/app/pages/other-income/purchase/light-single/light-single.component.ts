import { Component, computed, inject } from '@angular/core';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeLightEditComponent } from '../../../../components/other-income/edit/other-income-light-edit.component';
import { OtherIncomeBranchComponent } from '../../../../components/other-income/edit/other-income-branch/other-income-branch.component';
import { ToastService } from '../../../../service/toast/toast.service';
import { DecimalPipe } from '@angular/common';
import { OtherIncomeInvoicePeriodComponent } from "../../../../components/other-income/period/other-income-invoice-period.component";
import { OtherIncomeReciptPeriodComponent } from "../../../../components/other-income/period/other-income-recipt-period.component";
import { OTHER_INCOME_PAGE_TOKEN } from '../../../../lib';
import { formatLocalNumber } from '../../../../lib/formatter';
import { TFieldSelector } from '../../../../types';
import { TPopulatedPeriodResult } from '../../../../service/other-income/base-oi';
@Component({
  selector: 'app-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeLightEditComponent,
    OtherIncomeBranchComponent,
    OtherIncomeInvoicePeriodComponent,
    OtherIncomeReciptPeriodComponent
  ],
  templateUrl: './light-single.component.html'
})
export class LightSingleComponent {
  private pageToken = inject(OTHER_INCOME_PAGE_TOKEN)
  isPurchase = this.pageToken.isPurchase
  private lightServ = inject(OiLightService)
  data = this.lightServ.singleRecord
  invalidValue = computed(() => this.data().length !== 1)
  currentResult = computed(() => this.data()[0])

  branchList = computed(() => this.currentResult().branchList)
  incomeList = computed(() => this.currentResult().incomeList)
  periodList = computed(() => this.currentResult().periodList)

  private toastService = inject(ToastService)

  onRefetch() {
    this.lightServ.refetch();
  }

  onSuccess(value: string) {
    this.toastService.success(value);
    this.lightServ.refetch();
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
    { label: 'รายได้', fn: v => this._localFormatNumber(v.totalIncome) },
    { label: 'ยอดใบแจ้งหนี้', fn: v => this._localFormatNumber(v.invAmount) },
    { label: 'ยอดใบเสร็จ', fn: v => this._localFormatNumber(v.receAmount) },
  ]

  periodCreditSelector: TFieldSelector<TPopulatedPeriodResult>[] = [
    { label: 'ชื่อ', fn: v => v.periodName },
    { label: 'รายได้', fn: v => this._localFormatNumber(v.totalIncome) },
    { label: 'ยอดใบลดหนี้', fn: v => this._localFormatNumber(v.creditAmount) },
  ]

  private _genSelector = (incomeType: number) => {
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
