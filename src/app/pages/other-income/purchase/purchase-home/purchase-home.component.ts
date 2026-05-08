import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OiNotLightListService } from '../../../../service/other-income/oi-not-light-list.service';
import { DatePipe } from '@angular/common';
import { OtherIncomePurchasingQueryTabComponent } from "../../account/other-income-purchasing-query-tab.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-home',
  imports: [RouterLink, DatePipe, OtherIncomePurchasingQueryTabComponent, FormsModule],
  templateUrl: './purchase-home.component.html',
  styleUrl: './purchase-home.component.scss',
})
export class PurchaseHomeComponent {
  private readonly notLightServ = inject(OiNotLightListService)

  term = this.notLightServ.term
  mode = this.notLightServ.mode
  queryKey = this.notLightServ.queryKey
  compType = this.notLightServ.compType
  get filterStatus() { return this.notLightServ.filterStatus() }
  set filterStatus(v: boolean) { this.notLightServ.filterStatus.set(v) }
  eventFilter = this.notLightServ.eventFilter
  rederList = this.notLightServ.notLightList

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  genUrl = (id: number, compType?: string) => {
    return this.router.createUrlTree([id,], { relativeTo: this.route, queryParams: { compType } })
  }
}
