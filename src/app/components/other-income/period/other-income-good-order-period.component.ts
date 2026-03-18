import { Component, input } from '@angular/core';
import { TFreeItemDto } from '../../../service/other-income/base-oi';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { BasePeriodComponent } from './base-period.component';

@Component({
  selector: 'app-other-income-good-order-period',
  imports: [FormsModule, DecimalPipe],
  template: `    <div class="mb-3">
        <div class="px-3 pt-2 pb-1 text-muted small fw-semibold">สินค้าแถม</div>
        <table class="table">
          <thead>
            <tr>
              <th scope="col" style="width: 25%;">เลขใบ PO</th>
              <th scope="col" style="width: 25%;">รายได้บันทึก</th>
              <th scope="col" style="width: 25%;">ใบแจ้งหนี้ซัพ</th>
              <th scope="col" style="width: 25%;">ใบเสร็จรับเงิน</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orderList(); track order.id) {
            <tr>
              <td scope="row">{{ order.orderNumb }}</td>
              <td>{{ order.actualAmount | number : "1.2-2" }}</td>
              <td>{{ order.supInvNumb  }}</td>
              <td>{{ order.receNumb  }}</td>
            </tr>
            }
          </tbody>
        </table>
      </div>`,
  styles: ``
})
export class OtherIncomeGoodOrderPeriodComponent extends BasePeriodComponent {
  orderList = input.required<TFreeItemDto[]>();
  periodId = input.required<number>();
  actualAmount = input.required<number>();
  canEdit = input(false);
  compType = input.required<string | undefined>();
  compCode = input.required<string | undefined>();
  disabled = input(false);
}
