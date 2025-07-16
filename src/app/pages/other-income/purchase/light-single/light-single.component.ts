import { Component, computed, inject } from '@angular/core';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TCompType } from '../../../../types';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";

@Component({
  selector: 'app-light-single',
  imports: [OtherIncomeHeadEditComponent],
  templateUrl: './light-single.component.html',
  styleUrl: './light-single.component.scss'
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
  eventDetail = computed(() => {
    // const cur = this.currentResult()
    // const { notLightId, cn, displayName, incVat, capAmount,
    //   discount: { id: discountId, discountName },
    //   income: { incomeName, id: incomeId, isProduct },
    //   stepList, isStep
    // } = cur
    // return { notLightId, discountId, discountName, incomeId, isProduct, incomeName, cn, displayName, capAmount, incVat, stepList, isStep }
  })

  // productDetail = computed(() => {
  //   const cur = this.currentResult()
  //   const { productList, income: { isProduct } } = cur
  //   return { productList, isProduct }
  // })
  // stepInfo = computed(() => {
  //   const cur = this.currentResult()
  //   const { isStep, stepList, notLightId } = cur
  //   return { isStep, stepList, notLightId }
  // })
  private modalService = inject(NgbModal)
  openModal(content: any) {
    this.modalService.open(content)
  }
}
