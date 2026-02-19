import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CUSTOM_FIELD_SEARCH_TOKEN, OTHER_INCOME_L_SEARCH } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { OtherIncomeAccountQueryTabComponent } from "./other-income-account-query-tab.component";
import { PeriodLightService } from '../../../service/other-income/period-light.service';
import { getPeriodStatusLabel, getPeriodStatusBadgeClass, formatAmountProgress } from '../../../lib/other-income/period-status-utils';
import { formatLocalNumber } from '../../../lib/formatter';
import { PeriodStatus } from '../../../types/other-income';

@Component({
  selector: 'app-account-light-box',
  imports: [RouterLink, OtherIncomeAccountQueryTabComponent],
  template: `
    <div>
      <h1 class="text-center">รายการรายได้อื่น</h1>
      <app-other-income-account-query-tab [(param)]="param" [disbleMode]="true" eventFilter="light" />
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>กิจกรรม</th>
            <th>ชื่อเรียก</th>
            <th>ชื่อซัพพลายเออร์</th>
            <th>ชื่อ period</th>
            <th>สถานะ</th>
            <!-- <th>ความคืบหน้า</th> -->
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
            <!-- <td>
              @if (item.periodStatus === PeriodStatus.Invoice) {
                <small class="text-muted">รอใบแจ้งหนี้</small>
              } @else if (item.periodStatus === PeriodStatus.Receipt) {
                <div class="text-muted small">
                  <div>ใบแจ้งหนี้: {{ formatNumber(item.invAmount) }} บาท</div>
                  <div>ใบเสร็จ: {{ formatAmountProgress(item.receAmount, item.invAmount) }}</div>
                </div>
              } @else if (item.periodStatus === PeriodStatus.Complete) {
                <small class="text-success">เสร็จสมบูรณ์</small>
              }
            </td> -->
            <td><a [routerLink]="genUrl(item.company.compCode, item.company.compType, item.id)">รายละเอียด</a></td>
          </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  providers: [
    {
      provide: CUSTOM_FIELD_SEARCH_TOKEN,
      useValue: OTHER_INCOME_L_SEARCH
    }
  ]
})
export class AccountLightBoxComponent {
  private readonly periodLight = inject(PeriodLightService)
  data = this.periodLight.modPeriod
  param = this.periodLight.params
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
