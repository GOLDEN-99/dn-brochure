import { Component, inject } from '@angular/core';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { IbobQueryTabComponent } from '../../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab.component';
import { DatePipe } from '@angular/common';
import { CUSTOM_FIELD_SEARCH_TOKEN, OTHER_INCOME_L_SEARCH } from '../../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-purchasing-light-home',
  imports: [IbobQueryTabComponent, DatePipe, RouterLink],
  templateUrl: './purchasing-light-home.component.html',
  styleUrl: './purchasing-light-home.component.scss',
  providers: [
    {
      provide: CUSTOM_FIELD_SEARCH_TOKEN,
      useValue: OTHER_INCOME_L_SEARCH
    }
  ]
})
export class PurchasingLightHomeComponent {
  private notLightServ = inject(OiLightService)
  data = this.notLightServ.lightList
  onSearch({ field: mode, term }: any) {
    this.notLightServ.searchMany(mode, term)
  }
}


type TLightSummary = {}