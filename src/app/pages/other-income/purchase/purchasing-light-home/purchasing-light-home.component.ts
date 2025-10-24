import { Component, inject, signal } from '@angular/core';
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
  compType = signal(1)

  onSearch() {
    const term = this.term()
    const mode = this.mode()
    const compType = this.compType()
    this.notLightServ.searchMany(mode, term, compType)
  }

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  genUrl = (id: number, compType?: string) => {
    return this.router.createUrlTree([id], { relativeTo: this.route, queryParams: { compType } })
  }
}