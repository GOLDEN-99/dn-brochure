import { Component, computed, inject, input, signal } from '@angular/core';
import { TargetSubformComponent } from "../target-subform/target-subform.component";
import { FormsModule } from '@angular/forms';
import { IncomeSelectComponent } from "../income-select/income-select.component";
import { ApiService } from '../../../../service/api/api.service';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../service/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-other-income-not-light-form',
  imports: [TargetSubformComponent, FormsModule, IncomeSelectComponent],
  templateUrl: './other-income-not-light-form.component.html',
  styleUrl: './other-income-not-light-form.component.scss'
})
export class OtherIncomeNotLightFormComponent {
  private route = inject(ActivatedRoute)

  headId = input<number>()
  incomeId = signal(0)
  isProduct = signal(0)
  discountId = signal(1)
  incVat = signal(false)
  isDc = signal(false)
  isInce = signal(false)
  isComp = signal(false)
  stepType = signal(0)
  stepList = signal<AppStep[]>([])
  isRebate = signal(false)
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
  setCapNull = () => this.capAmount.set(null)
  setCapZero = () => this.capAmount.set(0)
  isNullCap = computed(() => this.capAmount() === null)

  disable = computed(() => {
    const invalidIncome = this.incomeId() === 0
    const invalidDiscount = this.discountId() === 0
    const invalidStep = this.invalidStep()
    const invalidCap = this.capAmount() === 0
    return invalidIncome || invalidDiscount || invalidStep || invalidCap
  })

  private api = inject(ApiService)
  private url = environment.oi

  get request() {
    const cn = this.cn()
    const displayName = this.displayName()
    const incomeId = this.incomeId()
    const incVat = this.incVat()
    const isRebate = this.isRebate()
    const isDc = this.isDc()
    const isComp = this.isComp()
    const isInce = this.isInce()
    const step = this.stepType()
    const capAmount = this.capAmount()
    const stepList = this.stepList().map((step, i, arr) => {
      const min = step.start
      const rate = step.percent
      const next = arr[i + 1]
      const nextStart = next?.start
      const max = typeof nextStart === 'number' ? nextStart : null
      return { min, max, rate } satisfies ReqStep
    })
    return {
      cn, displayName, incVat, capAmount, stepList, step, incomeId, isRebate, isInce, isComp, isDc
    }
  }
  private toastService = inject(ToastService)
  private router = inject(Router)
  onSubmit() {
    return this.api.post<{ id: number }>(
      `${this.url}/other-income/contact/not-light/${this.headId()}`,
      this.request
    ).subscribe(
      {
        next: (res) => {
          console.log(res)
          this.toastService.success('เพิ่มรายได้อื่นๆสำเร็จ')
          this.router.navigate(['../../'], { relativeTo: this.route })
        },
        error: (err) => {
          this.toastService.danger(`${err.message}`)
        }
      }
    )
  }
}

type AppStep = {
  start: number
  percent: number
}

type ReqStep = {
  min: number
  max: number | null
  rate: number
}
