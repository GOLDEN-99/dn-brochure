import { Component, computed, inject, signal } from '@angular/core';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeNotLightEditComponent } from "../../../../components/other-income/edit/other-income-not-light-edit/other-income-not-light-edit.component";
import { OtherIncomeProductEditComponent } from "../../../../components/other-income/edit/other-income-product-edit/other-income-product-edit.component";
import { FormsModule } from '@angular/forms';
import { OtherIncomeMonthlyEditComponent } from "../../../../components/other-income/edit/other-income-monthly-edit/other-income-monthly-edit.component";
import { OtherIncomeNotLightPeriodEditComponent } from "../../../../components/other-income/edit/other-income-not-light-period-edit/other-income-not-light-period-edit.component";
import { CreatePeriodComponent } from "../../../../components/other-income/create/create-period/create-period.component";
import { OtherIncomePeriodAccountComponent } from '../../../../components/other-income/edit/other-income-period-account/other-income-period-account.component';

@Component({
  selector: 'app-not-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeNotLightEditComponent,
    OtherIncomeMonthlyEditComponent, OtherIncomeProductEditComponent,
    OtherIncomeMonthlyEditComponent, OtherIncomeNotLightPeriodEditComponent,
    CreatePeriodComponent, OtherIncomePeriodAccountComponent,
    NgbDatepickerModule, FormsModule,
  ],
  templateUrl: './not-light-single.component.html',
  styleUrl: './not-light-single.component.scss'
})
export class NotLightSingleComponent {
  private notLightServ = inject(OiNotLightService)
  data = this.notLightServ.singleRecord
  invalidValue = computed(() => this.data().length !== 1)
  currentResult = computed(() => this.data()[0])
  head = computed(() => {
    const cur = this.currentResult()
    const { id, period, startDate, endDate, company: { compCode, compName, compType }, event: { id: eventId, eventName, isLight } } = cur
    return { id, period, startDate, endDate, compCode, compName, compType, eventId, eventName, isLight }
  })
  acc = computed(() => {
    const { accAmount, accIncome } = this.currentResult()
    return { accAmount, accIncome }
  })
  incomeList = computed(() => this.currentResult().incomeList)
  eventDetail = computed(() => {
    const cur = this.currentResult()
    const { notLightId, cn, displayName, incVat, capAmount,
      isRebate, isDc, isComp, isInce,
      income: { incomeName, id: incomeId, isProduct },
      stepList, isStep
    } = cur
    return { notLightId, isRebate, isDc, isComp, isInce, incomeId, isProduct, incomeName, cn, displayName, capAmount, incVat, stepList, isStep }
  })

  criteria = computed(() => {
    const cur = this.currentResult()
    const { isDc, isRebate, isComp, isInce, incVat } = cur
    return { isDc, isRebate, isComp, isInce, incVat }
  })

  productDetail = computed(() => {
    const cur = this.currentResult()
    const { productList, income: { isProduct } } = cur
    return { productList, isProduct }
  })
  stepInfo = computed(() => {
    const cur = this.currentResult()
    const { isStep, stepList, notLightId } = cur
    return { isStep, stepList, notLightId }
  })

  periodList = computed(() => this.currentResult().periodList)

  private modalService = inject(NgbModal)
  openModal(content: any) {
    this.modalService.open(content)
  }

}
