import { Component, inject } from '@angular/core';
import { OiLightListService } from '../../../../service/other-income/oi-light-list.service';
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
  private readonly lightServ = inject(OiLightListService)

  term = this.lightServ.term
  mode = this.lightServ.mode
  queryKey = this.lightServ.queryKey
  compType = this.lightServ.compType

  data = this.lightServ.lightList

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  genUrl = (id: number, compType?: string) => {
    return this.router.createUrlTree([id], { relativeTo: this.route, queryParams: { compType } })
  }
}
