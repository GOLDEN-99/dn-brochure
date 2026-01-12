import { Component, computed, inject } from '@angular/core';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeNotLightEditComponent } from "../../../../components/other-income/edit/other-income-not-light-edit/other-income-not-light-edit.component";
import { OtherIncomeProductEditComponent } from "../../../../components/other-income/edit/other-income-product-edit/other-income-product-edit.component";
import { FormsModule } from '@angular/forms';
import { OtherIncomeMonthlyEditComponent } from "../../../../components/other-income/edit/other-income-monthly-edit/other-income-monthly-edit.component";
import { CreatePeriodComponent } from "../../../../components/other-income/create/create-period/create-period.component";
import { ToastService } from '../../../../service/toast/toast.service';
import { OtherIncomeMonthlyIncentiveEditComponent } from "../../../../components/other-income/edit/other-income-monthly-incentive-edit/other-income-monthly-incentive-edit.component";
import { OtherIncomeMonthlyListComponent } from "../../../../components/other-income/template/other-income-monthly-list.component";
import { OTHER_INCOME_PAGE_TOKEN } from '../../../../lib';
import { OtherIncomePeriodDisplayComponent } from "../../../../components/other-income/period/other-income-period-display/other-income-period-display.component";

@Component({
  selector: 'app-not-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeNotLightEditComponent,
    OtherIncomeMonthlyEditComponent, OtherIncomeProductEditComponent,
    OtherIncomeMonthlyEditComponent, CreatePeriodComponent,
    NgbDatepickerModule, FormsModule,
    OtherIncomeMonthlyIncentiveEditComponent,
    OtherIncomeMonthlyListComponent,
    OtherIncomePeriodDisplayComponent
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
}