import { Component, computed, inject } from '@angular/core';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TCompType } from '../../../../types';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeLightEditComponent } from '../../../../components/other-income/edit/other-income-light-edit/other-income-light-edit.component';
import { OtherIncomeBranchComponent } from '../../../../components/other-income/edit/other-income-branch/other-income-branch.component';
import { OtherIncomeMonthlyLightEditComponent } from '../../../../components/other-income/edit/other-income-monthly-light-edit/other-income-monthly-light-edit.component';

@Component({
  selector: 'app-light-single',
  imports: [OtherIncomeHeadEditComponent, OtherIncomeLightEditComponent, OtherIncomeBranchComponent, OtherIncomeMonthlyLightEditComponent],
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
  lightId = computed(() => this.currentResult().lightId)
  eventDetail = computed(() => {
    const cur = this.currentResult()
    const { totalAmount, totalBranch } = cur
    return { totalAmount, totalBranch }
  })
  branchList = computed(() => this.currentResult().branchList)
  incomeList = computed(() => this.currentResult().incomeList)

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
