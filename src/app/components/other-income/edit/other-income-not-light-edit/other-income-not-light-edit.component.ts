import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TargetSubformComponent } from "../../form/target-subform/target-subform.component";
import { IncomeSelectComponent } from "../../form/income-select/income-select.component";
import { DiscountSubformComponent } from "../../form/discount-subform/discount-subform.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-other-income-not-light-edit',
  imports: [FormsModule, TargetSubformComponent, IncomeSelectComponent, DiscountSubformComponent],
  templateUrl: './other-income-not-light-edit.component.html',
  styleUrl: './other-income-not-light-edit.component.scss'
})
export class OtherIncomeNotLightEditComponent {
  eventDetail = input.required<TOiNlEditProps>()
  headId = input<number>()
  incomeId = signal(0)
  isProduct = signal(false)
  discountId = signal(1)
  incVat = signal(false)
  stepType = signal(0)
  stepList = signal<any[]>([])
  invalidStep = computed(() => {
    const stepType = this.stepType()
    if (stepType === 0) {
      return false
    }
    const stepList = this.stepList()
    return stepList.some(({ percent }) => percent === 0)
  })
  cn = signal('')
  displayName = signal('')
  capAmount = signal<number | null>(null)
  isNullCap = computed(() => this.capAmount() === null)

  disable = computed(() => {
    const invalidIncome = this.incomeId() === 0
    const invalidDiscount = this.discountId() === 0
    const invalidStep = this.invalidStep()
    const invalidCap = this.capAmount() === 0

    return invalidIncome || invalidDiscount || invalidStep || invalidCap
  })

  curStepType = computed(() => {
    const cur = this.eventDetail()
    const { stepList, isStep } = cur
    if (isStep) return 3
    if (stepList.length !== 1) return 2
    return 1
  })

  // private goodCodeSet = new Set<string>()

  // handleAdd(product: TOIProduct[]) {
  //   const validProduct = product.flatMap(({ goodCode, goodName }) => {
  //     const hasValue = this.goodCodeSet.has(goodCode)
  //     if (hasValue) return []
  //     this.goodCodeSet.add(goodCode)
  //     return [{ goodCode, goodName }]
  //   })
  //   this.productsList.update(prev => [...prev, ...validProduct])
  // }

  // handleDelete(goodCode: string) {
  //   const hasDel = this.goodCodeSet.delete(goodCode)
  //   if (hasDel) {
  //     this.productsList.update(prev => prev.filter(p => p.goodCode !== goodCode))
  //   }
  // }

  get request() {
    const cn = this.cn()
    const displayName = this.displayName()
    const discountId = this.discountId()
    const incomeId = this.incomeId()
    const incVat = this.incVat()
    const step = this.stepType()
    const capAmount = this.capAmount()
    const stepList = this.stepList().map((step, i, arr) => {
      const min = step.start
      const rate = step.percent
      const next = arr[i + 1]
      const nextStart = next?.start
      const max = typeof nextStart === 'number' ? nextStart : null
      return { min, max, rate }
    })
    // const productList = this.isProduct() ? this.productsList().map(({ goodCode }) => goodCode) : []
    return {
      cn, displayName, incVat, capAmount, stepList, step, discountId, incomeId
    }
  }

  submitForm() { }

  private modalService = inject(NgbModal)
  private notLightModal = viewChild('notLightModal')
  openModal() {
    const { cn, displayName, discountId, incomeId, stepList, isProduct } = this.eventDetail()
    this.incomeId.set(incomeId);
    this.discountId.set(discountId)
    this.cn.set(cn)
    this.displayName.set(displayName)
    this.isProduct.set(isProduct)
    const stepType = this.curStepType()
    this.stepType.set(stepType)
    const modStep = stepList.map(({ min, max, rate }) => ({ start: min, percent: rate }))
    this.stepList.set(modStep)
    this.modalService.open(this.notLightModal())
  }

}

type TOiNlEditProps = {
  notLightId: number
  discountId: number
  discountName: string
  incomeId: number
  incomeName: string
  isProduct: boolean
  cn: string
  capAmount: number | null
  displayName: string
  incVat: boolean
  isStep: boolean
  stepList: any[]
}
