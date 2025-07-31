import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DiscountSubformComponent } from "../discount-subform/discount-subform.component";
import { TargetSubformComponent } from "../target-subform/target-subform.component";
import { FormsModule } from '@angular/forms';
import { SearchProductSubformComponent } from "../search-product-subform/search-product-subform.component";
import { TOIProduct } from '../../../../types';
import { IncomeSelectComponent } from "../income-select/income-select.component";
import { ApiService } from '../../../../service/api/api.service';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../service/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-other-income-not-light-form',
  imports: [TargetSubformComponent, FormsModule, SearchProductSubformComponent, IncomeSelectComponent],
  templateUrl: './other-income-not-light-form.component.html',
  styleUrl: './other-income-not-light-form.component.scss'
})
export class OtherIncomeNotLightFormComponent {
  private route = inject(ActivatedRoute)
  compData$ = this.route.queryParamMap.pipe(
    map((query => {
      const compType = query.get("compType")
      const compCode = query.get("compCode")
      if (!compType || !compCode) return null
      return { compCode, compType }
    }))
  )

  compData = toSignal(this.compData$, { initialValue: null })
  invalidCompData = computed(() => this.compData() === null)

  headId = input<number>()
  incomeId = signal(0)
  isProduct = signal(false)
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
  isNullCap = computed(() => this.capAmount() === null)
  productsList = signal<TOIProduct[]>([])
  invalidProduct = computed(() => {
    const products = this.productsList()
    return products.length === 0
  })

  disable = computed(() => {
    const invalidIncome = this.incomeId() === 0
    const invalidDiscount = this.discountId() === 0
    const invalidStep = this.invalidStep()
    const invalidCap = this.capAmount() === 0
    const invalidProduct = this.invalidProduct()
    return invalidIncome || invalidDiscount || invalidStep || invalidCap || invalidProduct
  })

  private goodCodeSet = new Set<string>()

  handleAdd(product: TOIProduct[]) {
    const validProduct = product.flatMap(({ goodCode, goodName }) => {
      const hasValue = this.goodCodeSet.has(goodCode)
      if (hasValue) return []
      this.goodCodeSet.add(goodCode)
      return [{ goodCode, goodName }]
    })
    this.productsList.update(prev => [...prev, ...validProduct])
  }

  handleDelete(goodCode: string) {
    const hasDel = this.goodCodeSet.delete(goodCode)
    if (hasDel) {
      this.productsList.update(prev => prev.filter(p => p.goodCode !== goodCode))
    }
  }

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
    const productList = this.productsList().map(({ goodCode }) => goodCode)
    return {
      cn, displayName, incVat, capAmount, productList, stepList, step, incomeId, isRebate, isInce, isComp, isDc
    }
  }
  private toastService = inject(ToastService)
  private router = inject(Router)
  onSubmit() {
    console.log(this.request)
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
