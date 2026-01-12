import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TargetSubformComponent } from "../../form/target-subform.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-other-income-not-light-edit',
  imports: [FormsModule, TargetSubformComponent, DecimalPipe],
  templateUrl: './other-income-not-light-edit.component.html',
  styleUrl: './other-income-not-light-edit.component.scss'
})
export class OtherIncomeNotLightEditComponent {
  canEdit = input(false)
  notLight = input.required<TOiNlEditProps>()
  steps = input.required<any[]>()
  headId = input<number>()
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

  capAmount = signal<number | null>(null)
  isNullCap = computed(() => this.capAmount() === null)

  disable = computed(() => {
    const invalidStep = this.invalidStep()
    const invalidCap = this.capAmount() === 0

    return invalidStep || invalidCap
  })

  currentStepType = computed(() => this.notLight().stepType)

  curStepLabel = computed(() => {
    switch (this.currentStepType()) {
      case 1: return "บาทแรก"
      case 3: return "ขั้นบันได"
      case 2: return "บาทแรก"
      default: return "มีข้อผิดพลาด"
    }
  })
  get request() {
    const isRebate = this.isRebate()
    const isDc = this.isDc()
    const isComp = this.isComp()
    const isInce = this.isInce()
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
    return {
      incVat, capAmount, stepList, step, isRebate, isComp, isDc, isInce
    }
  }

  submitForm() { }

  private modalService = inject(NgbModal)
  private notLightModal = viewChild('notLightModal')
  openModal() {
    const { isRebate, isDc, isInce, isComp, incVat } = this.notLight()
    const stepList = this.steps()
    this.isRebate.set(isRebate);
    this.isDc.set(isDc);
    this.isInce.set(isInce);
    this.isComp.set(isComp);
    this.incVat.set(incVat);
    const stepType = this.currentStepType();
    this.stepType.set(stepType);
    const modStep = stepList.map(({ min, rate }) => ({ start: min, percent: rate }))
    this.stepList.set(modStep)
    this.modalService.open(this.notLightModal())
  }

}

type TOiNlEditProps = {
  id: number
  isRebate: boolean,
  isDc: boolean,
  isComp: boolean,
  isInce: boolean,
  capAmount: number | null
  incVat: boolean
  stepType: number
}
