import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { TOIProduct } from '../../../../types';
import { SearchProductSubformComponent } from "../search-product-subform/search-product-subform.component";
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-other-income-ince-form',
  imports: [SearchProductSubformComponent],
  templateUrl: './other-income-ince-form.component.html',
  styleUrl: './other-income-ince-form.component.scss'
})
export class OtherIncomeInceFormComponent {
  private route = inject(ActivatedRoute)
  compData$ = this.route.queryParamMap.pipe(
    map((query => {
      const compType = query.get("compType")
      const compCode = query.get("compCode")
      if (!compType || !compCode) return null
      return { compCode, compType }
    }))
  )
  comp = toSignal(this.compData$, { initialValue: null })
  productsList = signal<TOIProduct[]>([])
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
}
