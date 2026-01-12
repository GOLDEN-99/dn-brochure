import { Component, input, signal, viewChild } from '@angular/core';
import { TOrderItemDto } from '../../../service/other-income/base-oi';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { OtherIncomeOrderModalComponent } from './other-income-order-modal/other-income-order-modal.component';
import { BasePeriodComponent } from './base-period.component';

@Component({
  selector: 'app-other-income-order-period',
  imports: [FormsModule, DecimalPipe, OtherIncomeOrderModalComponent],
  template: `
    <div class="mb-3">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">เลขใบ PO</th>
              <th scope="col">รายได้บันทึก</th>
              <th scope="col">ใบแจ้งหนี้ซัพ</th>
              <th scope="col">ใบเสร็จรับเงิน</th>
              @if(canEdit()){
              <th scope="col">
                <button
                  class="btn btn-sm btn-primary me-1"
                  (click)="openPo()"
                  [disabled]="disabled()"
                  >
                  เพิ่ม po
                </button>
              </th>
            }
            </tr>
          </thead>
          <tbody>
            @for (order of orderList(); track order.id) {
            <tr>
              <td scope="row">{{ order.orderNumb }}</td>
              <td>{{ order.actualAmount | number : "1.2-2" }}</td>
              <td>{{ order.supInvNumb  }}</td>
              @if(canEdit()){
                <td colspan="2">{{ order.receNumb  }}</td>
              }@else{
                <td>{{ order.receNumb  }}</td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>

    <ng-template #poModal let-modal>
      <app-other-income-order-modal
        [periodAmount]="actualAmount()"
        [compCode]="compCode()"
        [compType]="compType()"
        [periodId]="periodId()"
        (success)="onSuccess($event)"
        (fail)="onFail($event)"
        (close)="modal.dismiss()"
      />
    </ng-template>
  `,
  styles: '',
})
export class OtherIncomeOrderPeriodComponent extends BasePeriodComponent {
  orderList = input.required<TOrderItemDto[]>();
  periodId = input.required<number>();
  actualAmount = input.required<number>();
  canEdit = input(false);
  compType = input.required<string | undefined>();
  compCode = input.required<string | undefined>();
  disabled = input(false);

  private poModal = viewChild('poModal');

  openPo() {
    this.openModal(this.poModal(), 'xl');
  }
}