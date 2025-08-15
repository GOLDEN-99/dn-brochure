import { Component, computed, inject } from '@angular/core';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { TCompType } from '../../../../types';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeLightEditComponent } from '../../../../components/other-income/edit/other-income-light-edit/other-income-light-edit.component';
import { OtherIncomeBranchComponent } from '../../../../components/other-income/edit/other-income-branch/other-income-branch.component';
import { OtherIncomeMonthlyLightEditComponent } from '../../../../components/other-income/edit/other-income-monthly-light-edit/other-income-monthly-light-edit.component';
import { CreatePeriodComponent } from '../../../../components/other-income/create/create-period/create-period.component';
import { ToastService } from '../../../../service/toast/toast.service';
import { DecimalPipe } from '@angular/common';
import { OtherIncomeInvoicePeriodComponent } from "../../../../components/other-income/period/other-income-invoice-period.component";
import { OtherIncomeReciptPeriodComponent } from "../../../../components/other-income/period/other-income-recipt-period.component";
@Component({
  selector: 'app-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeLightEditComponent,
    OtherIncomeBranchComponent, OtherIncomeMonthlyLightEditComponent,
    CreatePeriodComponent, DecimalPipe,
    OtherIncomeInvoicePeriodComponent,
    OtherIncomeReciptPeriodComponent
  ],
  templateUrl: './light-single.component.html'
})
export class LightSingleComponent {
  private lightServ = inject(OiLightService)
  data = this.lightServ.singleRecord
  invalidValue = computed(() => this.data().length !== 1)
  currentResult = computed(() => this.data()[0])
  head = computed(() => {
    const cur = this.currentResult()
    const { id, period, startDate, endDate, company: { compCode, compName, compType }, event: { id: eventId, eventName, isLight } } = cur
    const validCompType: TCompType = compType === 'HU' ? 'HU' : 'DN'
    return {
      id,
      period,
      startDate,
      endDate,
      compCode,
      compName,
      compType: validCompType,
      eventId, eventName,
      isLight
    }
  })
  lightId = computed(() => this.currentResult().lightId)
  eventDetail = computed(() => {
    const cur = this.currentResult()
    const { totalAmount, totalBranch } = cur
    return { totalAmount, totalBranch }
  })
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
}
