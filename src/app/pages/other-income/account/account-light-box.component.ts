import { Component, inject } from '@angular/core';
import { OiLightService } from '../../../service/other-income/oi-light.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CUSTOM_FIELD_SEARCH_TOKEN, OTHER_INCOME_L_SEARCH } from '../../../components/inbound-outbound/ibob-query-tab/ibob-query-tab-token';
import { OtherIncomeAccountQueryTabComponent } from "./other-income-account-query-tab.component";
import { PeriodNotLightService } from '../../../service/other-income/period-not-light.service';
import { PeriodLightService } from '../../../service/other-income/period-light.service';

@Component({
  selector: 'app-account-light-box',
  imports: [DatePipe, RouterLink, OtherIncomeAccountQueryTabComponent],
  template: `
    <div>
      <h1 class="text-center">รายการรายได้อื่น</h1>
      <app-other-income-account-query-tab [(param)]="param" [disbleMode]="true" eventFilter="light" />
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>กิจกรรม</th>
            <th>เริ่ม</th>
            <th>จบ</th>
            <th>ชื่อซัพพลายเออร์</th>
            <th>จำนวนสาขา</th>
            <th>ยอดสูงสุด</th>
            <th>สถานะ</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          @for (item of data(); track $index) {
          <tr>
            <td>{{ item.event.eventName }}</td>
            <td>{{ item.startDate | date }}</td>
            <td>{{ item.endDate | date }}</td>
            <td>{{ item.company.compName }}</td>
            <td>{{ item.totalBranch }}</td>
            <td>{{ item.totalAmount }}</td>
            <td>{{ item.status }}</td>
            <td><a [routerLink]="genUrl(item.company.compCode, item.company.compType, item.id)">ดู</a></td>
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
  private periodLight = inject(PeriodLightService)
  data = this.periodLight.modPeriod
  term = this.periodLight.term
  status = this.periodLight.filter
  comp = this.periodLight.comp
  param = this.periodLight.params2
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  genUrl(compCode: string, compType: string, id: number) {
    return this.router.createUrlTree([id], { relativeTo: this.route, queryParams: { compCode, compType } })
  }
}
