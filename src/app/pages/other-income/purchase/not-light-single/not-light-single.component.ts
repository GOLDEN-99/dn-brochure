import { Component, computed, inject, signal } from '@angular/core';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { DatePipe } from '@angular/common';
import { NgbDatepickerModule, NgbDatepickerNavigateEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeNotLightEditComponent } from "../../../../components/other-income/edit/other-income-not-light-edit/other-income-not-light-edit.component";
import { OtherIncomeProductEditComponent } from "../../../../components/other-income/edit/other-income-product-edit/other-income-product-edit.component";
import { FormsModule } from '@angular/forms';
import { MonthSelectComponent } from "../../../../components/date-input/month-select.component";
import { YearSelectComponent } from "../../../../components/date-input/year-select.component";

@Component({
  selector: 'app-not-light-single',
  imports: [OtherIncomeHeadEditComponent, OtherIncomeNotLightEditComponent, OtherIncomeProductEditComponent, NgbDatepickerModule, FormsModule, MonthSelectComponent, YearSelectComponent],
  templateUrl: './not-light-single.component.html',
  styleUrl: './not-light-single.component.scss'
})
export class NotLightSingleComponent {
  monthYear = signal({ year: 2025, month: 7, day: 1 })
  navigateFn(e: NgbDatepickerNavigateEvent) {
    this.monthYear.update(prev => ({ ...prev, ...e.next }))
  }
  private notLightServ = inject(OiNotLightService)
  data = this.notLightServ.singleRecord
  invalidValue = computed(() => this.data().length !== 1)
  currentResult = computed(() => this.data()[0])
  head = computed(() => {
    const cur = this.currentResult()
    const { id, period, startDate, endDate, company: { compCode, compName, compType }, event: { id: eventId, eventName, isLight } } = cur
    return { id, period, startDate, endDate, compCode, compName, compType, eventId, eventName, isLight }
  })
  eventDetail = computed(() => {
    const cur = this.currentResult()
    const { notLightId, cn, displayName, incVat, capAmount,
      discount: { id: discountId, discountName },
      income: { incomeName, id: incomeId, isProduct },
      stepList, isStep
    } = cur
    return { notLightId, discountId, discountName, incomeId, isProduct, incomeName, cn, displayName, capAmount, incVat, stepList, isStep }
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
  private modalService = inject(NgbModal)
  openModal(content: any) {
    this.modalService.open(content)
  }
}
