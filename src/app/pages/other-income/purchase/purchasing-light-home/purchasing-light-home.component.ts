import { Component, computed, inject, signal } from '@angular/core';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OtherIncomePurchasingQueryTabComponent } from "../../account/other-income-purchasing-query-tab.component";

@Component({
  selector: 'app-purchasing-light-home',
  imports: [DatePipe, RouterLink, OtherIncomePurchasingQueryTabComponent],
  templateUrl: './purchasing-light-home.component.html',
  styleUrl: './purchasing-light-home.component.scss',
})
export class PurchasingLightHomeComponent {
  private notLightServ = inject(OiLightService)
  data = this.notLightServ.lightList
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
    return this.router.createUrlTree([id], { relativeTo: this.route, queryParams: { compType } })
  }
}