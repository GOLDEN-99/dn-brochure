import { Component, inject, signal } from '@angular/core';
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
    return this.router.createUrlTree([id,], { relativeTo: this.route, queryParams: { compType } })
  }
}


