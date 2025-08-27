import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TargetSubformComponent } from "../../form/target-subform/target-subform.component";
import { IncomeSelectComponent } from "../../form/income-select/income-select.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-other-income-not-light-edit',
  imports: [FormsModule, TargetSubformComponent, IncomeSelectComponent],
  templateUrl: './other-income-not-light-edit.component.html',
  styleUrl: './other-income-not-light-edit.component.scss'
})
export class OtherIncomeNotLightEditComponent {
  canEdit = input(false)
  eventDetail = input.required<TOiNlEditProps>()
  headId = input<number>()
  incomeId = signal(0)
  isProduct = signal(0)
  isRebate = signal(false)
  isDc = signal(false)
  isComp = signal(false)
  isInce = signal(false)
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
    const invalidStep = this.invalidStep()
    const invalidCap = this.capAmount() === 0

    return invalidIncome || invalidStep || invalidCap
  })

  curStepType = computed(() => {
    const cur = this.eventDetail()
    const { stepList, isStep } = cur
    if (isStep) return 3
    if (stepList.length !== 1) return 2
    return 1
  })
  curStepLabel = computed(() => {
    switch (this.curStepType()) {
      case 1: return "บาทแรก"
      case 3: return "ขั้นบันได"
      case 2: return "บาทแรก"
    }
  })
  get request() {
    const cn = this.cn()
    const displayName = this.displayName()
    const isRebate = this.isRebate()
    const isDc = this.isDc()
    const isComp = this.isComp()
    const isInce = this.isInce()
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
      cn, displayName, incVat, capAmount, stepList, step, isRebate, isComp, isDc, isInce, incomeId
    }
  }

  submitForm() { }

  private modalService = inject(NgbModal)
  private notLightModal = viewChild('notLightModal')
  openModal() {
    const { cn, displayName, isRebate, isDc, isInce, isComp, incomeId, stepList, isProduct, incVat } = this.eventDetail()
    this.incomeId.set(incomeId);
    this.isRebate.set(isRebate);
    this.isDc.set(isDc);
    this.isInce.set(isInce);
    this.isComp.set(isComp);
    this.incVat.set(incVat)
    this.cn.set(cn)
    this.displayName.set(displayName)
    this.isProduct.set(isProduct)
    const stepType = this.curStepType()
    this.stepType.set(stepType)
    const modStep = stepList.map(({ min, rate }) => ({ start: min, percent: rate }))
    this.stepList.set(modStep)
    this.modalService.open(this.notLightModal())
  }

}

type TOiNlEditProps = {
  notLightId: number
  isRebate: boolean,
  isDc: boolean,
  isComp: boolean,
  isInce: boolean,
  incomeId: number
  incomeName: string
  isProduct: number
  cn: string
  capAmount: number | null
  displayName: string
  incVat: boolean
  isStep: boolean
  stepList: any[]
}
