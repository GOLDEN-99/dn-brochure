import { Component, computed, inject, signal } from '@angular/core';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

@Component({
  selector: 'app-not-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeNotLightEditComponent,
    OtherIncomeMonthlyEditComponent, OtherIncomeProductEditComponent,
    OtherIncomeMonthlyEditComponent, CreatePeriodComponent,
    OtherIncomeOrderPeriodComponent,
    OtherIncomeReciptPeriodComponent, OtherIncomeInvoicePeriodComponent,
    NgbDatepickerModule, FormsModule, DecimalPipe,
    OtherIncomeGoodOrderPeriodComponent
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
  head = computed(() => {
    const cur = this.currentResult()
    const { head: { id, period, startDate, endDate }, company: { compCode, compName, compType }, event: { id: eventId, eventName, eventType: isLight } } = cur
    return { id, period, startDate, endDate, compCode, compName, compType, eventId, eventName, isLight }
  })
  acc = computed(() => {
    const { head: { accAmount, accIncome } } = this.currentResult()
    return { accAmount, accIncome }
  })
  incomeList = computed(() => this.currentResult().incomeList)
  eventDetail = computed(() => {
    const notLightData = this.currentResult().notLight
    if (!notLightData) return null
    const { id: notLightId, isComp, isDc, isInce, isRebate, isStep, incVat, capAmount } = notLightData
    const { head,
      income: { id: incomeId, incomeName, isProduct }, stepList } = this.currentResult()
    return { notLightId, isComp, isInce, isDc, isStep, isRebate, incVat, capAmount, ...head, incomeId, incomeName, isProduct, displayName: '', cn: '', stepList }
  })

  isProduct = computed(() => this.currentResult().income.isProduct)

  criteria = computed(() => {
    const { notLight } = this.currentResult()
    if (!notLight) return null
    const { isComp, isDc, isInce, incVat, isRebate } = notLight
    return { isDc, isRebate, isComp, isInce, incVat }
  })

  productDetail = computed(() => {
    const cur = this.currentResult()
    const { productList, income: { isProduct } } = cur
    return { productList, isProduct }
  })
  stepInfo = computed(() => {
    const { stepList, notLight } = this.currentResult()
    if (notLight == null) {
      return null
    }
    return { isStep: notLight.isStep, stepList, notLightId: notLight.id }
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
