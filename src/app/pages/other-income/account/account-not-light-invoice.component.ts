import { Component, inject } from '@angular/core';
import { CUSTOM_FIELD_SEARCH_TOKEN, OTHER_INCOME_NL_SEARCH } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OtherIncomeAccountQueryTabComponent } from "./other-income-account-query-tab.component";
import { PeriodNotLightService } from '../../../service/other-income/period-not-light.service';
import { getPeriodStatusLabel, getPeriodStatusBadgeClass, formatAmountProgress } from '../../../lib/other-income/period-status-utils';
import { formatLocalNumber } from '../../../lib/formatter';
import { PeriodStatus } from '../../../types/other-income';

@Component({
  selector: 'app-account-not-light-invoice',
  imports: [RouterLink, OtherIncomeAccountQueryTabComponent],
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
            <th>ชื่อรายรับภายใน</th>
            <th>ชื่อซัพพลายเออร์</th>
            <th>ชื่อเพื่ออกใบแจ้งหนี้</th>
            <th>สถานะ</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          @for (item of data(); track item.periodId) {
          <tr>
            <td>{{ item.event.eventName }}</td>
            <td>{{ item.displayName }}</td>
            <td>{{ item.company.compName }}</td>
            <td>{{ item.periodName }}</td>
            <td>
              <span [class]="getStatusBadgeClass(item.periodStatus)">
                {{ getStatusLabel(item.periodStatus) }}
              </span>
            </td>
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
  private readonly periodNotLight = inject(PeriodNotLightService)
  parmas = this.periodNotLight.params
  data = this.periodNotLight.modPeriod

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  // Helper methods for template
  getStatusLabel = getPeriodStatusLabel;
  getStatusBadgeClass = getPeriodStatusBadgeClass;
  formatAmountProgress = formatAmountProgress;
  formatNumber = formatLocalNumber;
  PeriodStatus = PeriodStatus;

  genUrl(compCode: string, compType: string, id: number) {
    return this.router.createUrlTree([id], { relativeTo: this.route, queryParams: { compCode, compType } })
  }

}
