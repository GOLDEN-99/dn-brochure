import { Component, computed, inject } from '@angular/core';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeLightEditComponent } from '../../../../components/other-income/edit/other-income-light-edit.component';
import { OtherIncomeBranchComponent } from '../../../../components/other-income/edit/other-income-branch/other-income-branch.component';
import { ToastService } from '../../../../service/toast/toast.service';
import { OTHER_INCOME_PAGE_TOKEN } from '../../../../lib';
import { OtherIncomePeriodDisplayComponent } from "../../../../components/other-income/period/other-income-period-display/other-income-period-display.component";
@Component({
  selector: 'app-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeLightEditComponent,
    OtherIncomeBranchComponent,
    OtherIncomePeriodDisplayComponent
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
  periodId = computed(() => this.periodList()[0]?.id ?? -1)
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
