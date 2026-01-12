import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { DatePipe } from '@angular/common';
import { OtherIncomePurchasingQueryTabComponent } from "../../account/other-income-purchasing-query-tab.component";

@Component({
  selector: 'app-purchase-home',
  imports: [RouterLink, DatePipe, OtherIncomePurchasingQueryTabComponent],
  templateUrl: './purchase-home.component.html',
  styleUrl: './purchase-home.component.scss',
})
export class PurchaseHomeComponent {
  private notLightServ = inject(OiNotLightService)
  data = this.notLightServ.notLightList

  term = signal("")
  mode = signal(1)
  queryKey = computed(() => {
    const mode = this.mode()
    switch (mode) {
      case 1: return 'compCode'
      case 2: return 'compName'
      case 3: return 'goodCode'
      default: return ''
    }
  })
  compType = signal(1)
  compTypeString = computed(() => {
    const compType = this.compType()
    return compType === 1 ? 'DN' : 'HU'
  })
  onSearch() {
    const term = this.term()
    const queryKey = this.queryKey()
    if (queryKey === '' || term === '') return
    const compType = this.compTypeString()
    this.notLightServ.searchMany({ compType, [queryKey]: term })
  }


  private router = inject(Router)
  private route = inject(ActivatedRoute)
  genUrl = (id: number, compType?: string) => {
    return this.router.createUrlTree([id,], { relativeTo: this.route, queryParams: { compType } })
  }
}


