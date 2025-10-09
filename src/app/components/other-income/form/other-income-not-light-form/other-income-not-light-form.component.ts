import { Component, computed, inject, input, signal } from '@angular/core';
import { TargetSubformComponent } from "../target-subform.component";
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../service/api/api.service';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../service/toast/toast.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-other-income-not-light-form',
  imports: [TargetSubformComponent, FormsModule, RouterLink],
  templateUrl: './other-income-not-light-form.component.html',
  styleUrl: './other-income-not-light-form.component.scss'
})
export class OtherIncomeNotLightFormComponent {

  private route = inject(ActivatedRoute)

  headId = input<number>()
  incVat = signal(false)
  isDc = signal(false)
  isInce = signal(false)
  isComp = signal(false)
  stepType = signal(0)
  stepList = signal<AppStep[]>([])
  isRebate = signal(false)
  invalidStep = computed(() => {
    const stepType = this.stepType()
    if (stepType === 0) return true
    const stepList = this.stepList()
    return stepList.some(({ percent }) => percent === 0)
  })
  capAmount = signal<number | null>(null)
  invalidCap = computed(() => {
    const capAmount = this.capAmount()
    if (capAmount === null) return false
    const parseCap = Number(capAmount)
    return isNaN(parseCap) || parseCap === 0
  })
  setCapNull = () => this.capAmount.set(null)
  setCapZero = () => this.capAmount.set(0)
  isNullCap = computed(() => this.capAmount() === null)

  disable = computed(() => {
    const invalidStep = this.invalidStep()
    const invalidCap = this.invalidCap()
    return invalidStep || invalidCap
  })

  private api = inject(ApiService)
  private url = environment.oi

  get request() {
    const incVat = this.incVat()
    const isRebate = this.isRebate()
    const isDc = this.isDc()
    const isComp = this.isComp()
    const isInce = this.isInce()
    const stepType = this.stepType()
    const capAmount = Number(this.capAmount())
    const stepList = this.stepList().map((step, i, arr) => {
      const min = Number(step.start)
      const rate = Number(step.percent)
      const next = arr[i + 1]
      const nextStart = next?.start
      const max = typeof nextStart === 'number' ? nextStart : null
      return { min, max, rate } satisfies ReqStep
    })
    const invalidValue = stepList.some(({ min, rate }) => isNaN(min) || isNaN(rate))
    if (invalidValue) throw new Error('target ไม่ถูกต้อง')
    return {
      incVat, capAmount, stepList, stepType, isRebate, isInce, isComp, isDc
    }
  }
  private toastService = inject(ToastService)
  private router = inject(Router)
  onSubmit() {
    try {
      this.api.post<{ id: number }>(
        `${this.url}/other-income/contact/not-light/${this.headId()}`,
        this.request
      ).subscribe(
        {
          next: (res) => {
            this.toastService.success('เพิ่มรายได้อื่นๆสำเร็จ')
            this.router.navigate(['../../'], { relativeTo: this.route })
          },
          error: (err) => {
            this.toastService.danger(`${err.message}`)
          }
        }
      )
    } catch (err) {
      if (err instanceof Error) {
        this.toastService.danger(err.message)
        return
      }
      this.toastService.danger(String(err))
    }
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
