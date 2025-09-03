import { Component, computed, inject } from '@angular/core';
import { CUSTOM_FIELD_SEARCH_TOKEN, OTHER_INCOME_NL_SEARCH } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OiNotLightService } from '../../../service/other-income/oi-not-light.service';
import { OtherIncomeAccountQueryTabComponent } from "./other-income-account-query-tab.component";
import { PeriodNotLightService } from '../../../service/other-income/period-not-light.service';

@Component({
  selector: 'app-account-not-light-invoice',
  imports: [RouterLink, DatePipe, OtherIncomeAccountQueryTabComponent],
  providers: [
    {
      provide: CUSTOM_FIELD_SEARCH_TOKEN,
      useValue: OTHER_INCOME_NL_SEARCH
    }
  ],
  template: `
    <div>
      <h1 class="text-center">รายการรายได้อื่น</h1>
      <app-other-income-account-query-tab 
      eventFilter="not-light"
      [(param)]="parmas"
      />
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>กิจกรรม</th>
            <th>เริ่ม</th>
            <th>จบ</th>
            <th>ชื่อซัพพลายเออร์</th>
            <th>ชื่อเรียกเก็บ period</th>
            <th>สถานะ</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          @for (item of data(); track item.id) {
          <tr>
            <td>{{ item.event.eventName }}</td>
            <td>{{ item.startDate | date }}</td>
            <td>{{ item.endDate | date }}</td>
            <td>{{ item.company.compName }}</td>
            <td>{{ item.periodName }}</td>
            <td>{{ item.status }}</td>
            <td><a [routerLink]="genUrl(item.company.compCode, item.company.compType, item.id)">รายละเอียด</a></td>
          </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: ''
})
export class AccountNotLightInvoiceComponent {
  private periodNotLight = inject(PeriodNotLightService)
  parmas = this.periodNotLight.params
  data = this.periodNotLight.modPeriod



  private router = inject(Router)
  private route = inject(ActivatedRoute)
  genUrl(compCode: string, compType: string, id: number) {
    return this.router.createUrlTree([id], { relativeTo: this.route, queryParams: { compCode, compType } })
  }
}
