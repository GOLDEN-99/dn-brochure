import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateInputComponent } from "../../../date-input/date-input.component";
import { OiBaseformService } from '../../../../service/other-income/oi-baseform.service';
import { SearchCompSubformComponent } from "../search-comp-subform/search-comp-subform.component";
import { EventSelectComponent } from "../event-select/event-select.component";
import { SearchProductSubformComponent } from "../search-product-subform/search-product-subform.component";
import { TOIProduct } from '../../../../types';

@Component({
  selector: 'app-other-income-baseform',
  imports: [FormsModule, DateInputComponent, SearchCompSubformComponent, EventSelectComponent, SearchProductSubformComponent],
  templateUrl: './other-income-baseform.component.html',
  styleUrl: './other-income-baseform.component.scss'
})
export class OtherIncomeBaseformComponent {
  private baseFormService = inject(OiBaseformService)
  state = this.baseFormService.baseformState
  private updator = this.baseFormService.updateOneField
  updateCompCode = this.updator('compCode')
  updateCompName = this.updator('compName')
  updateCompType = this.updator('compType')
  updateEvent = this.updator('eventId')
  updatePeriod = this.updator('period')
  updateStartDate = this.updator('startDate')
  updateEndDate = this.updator('endDate')
  mode = input<TFilter>('light')
  isLightChange = output<number>()
  productList = this.baseFormService.productList
  private goodCodeSet = new Set<string>()

  handleAdd(product: TOIProduct[]) {
    const validProduct = product.flatMap(({ goodCode, goodName }) => {
      const hasValue = this.goodCodeSet.has(goodCode)
      if (hasValue) return []
      this.goodCodeSet.add(goodCode)
      return [{ goodCode, goodName }]
    })
    this.productList.update(prev => prev === null ? [...validProduct] : [...prev, ...validProduct])
  }

  handleDelete(goodCode: string) {
    const hasDel = this.goodCodeSet.delete(goodCode)
    if (hasDel) {
      this.productList.update(prev => prev === null ? [] : prev.filter(p => p.goodCode !== goodCode))
    }
  }
}

type TFilter = 'light' | 'not-light' | 'all'