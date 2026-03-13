import { Component, input } from '@angular/core';
import { TOrderItemDto } from '../../../service/other-income/base-oi';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { BasePeriodComponent } from './base-period.component';

@Component({
  selector: 'app-other-income-good-order-period',
  imports: [FormsModule, DecimalPipe],
  template: `    <div class="mb-3">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">เลขใบ PO</th>
              <th scope="col">รายได้บันทึก</th>
              <th scope="col">ใบแจ้งหนี้ซัพ</th>
              <th scope="col">ใบเสร็จรับเงิน</th>
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
  orderList = input.required<TOrderItemDto[]>();
  periodId = input.required<number>();
  actualAmount = input.required<number>();
  canEdit = input(false);
  compType = input.required<string | undefined>();
  compCode = input.required<string | undefined>();
  disabled = input(false);
}
