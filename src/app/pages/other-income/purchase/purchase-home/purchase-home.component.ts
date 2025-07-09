import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IbobQueryTabComponent } from "../../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab.component";
import { CUSTOM_FIELD_SEARCH_TOKEN, OTHER_INCOME_SEARCH } from '../../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-purchase-home',
  imports: [RouterLink, IbobQueryTabComponent, DatePipe],
  templateUrl: './purchase-home.component.html',
  styleUrl: './purchase-home.component.scss',
  providers: [
    {
      provide: CUSTOM_FIELD_SEARCH_TOKEN,
      useValue: OTHER_INCOME_SEARCH
    }
  ]
})
export class PurchaseHomeComponent {
  private notLightServ = inject(OiNotLightService)
  data = this.notLightServ.notLightList
}


