import { Component, input, viewChild } from '@angular/core';
import { TReceiptItemDto } from '../../../service/other-income/base-oi';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OtherIncomeReceiptModalComponent } from './other-income-receipt-modal.component';
import { BasePeriodComponent } from './base-period.component';

@Component({
  selector: 'app-other-income-receipt-period',
  imports: [FormsModule, DecimalPipe, OtherIncomeReceiptModalComponent, DatePipe],
  template: `
    <div class="mb-3">

        <table class="table">
          <thead>
            <tr>
              <th scope="col">เลขใบเสร็จ</th>
              <th scope="col">ยอดใบเสร็จ</th>
              <th scope="col">หมายเหตุ</th>
              <th scope="col">วันที่ใบเสร็จ</th>
              @if(canEdit()){
              <th scope="col">
                  <button
                  class="btn btn-sm btn-secondary"
                  (click)="openReceipt()"
                  [disabled]="disabled()"
                  >
                  เพิ่มใบเสร็จรับเงิน
                </button>
              </th>
            }
            </tr>
          </thead>
          <tbody>
            @for (inv of receiptList(); track inv.id) {
            <tr>
              <td scope="row">{{ inv.receNumb }}</td>
              <td>{{ inv.receAmount| number : "1.2-2" }}</td>
              <td>{{ inv.receRemark  }}</td>
              @if(canEdit()){
                <td colspan="2">{{ inv.receDate | date}}</td>
              }@else {
                <td>{{ inv.receDate | date}}</td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>

    <ng-template #receiptModal let-modal>
      <app-other-income-receipt-modal
        [periodId]="periodId()"
        [invAmount]="invAmount()"
        [receAmount]="receAmount()"
        (success)="onSuccess($event)"
        (fail)="onFail($event)"
        (close)="modal.dismiss()"
      />
    </ng-template>
  `,
  styles: '',
})
export class OtherIncomeReceiptPeriodComponent extends BasePeriodComponent {
  receiptList = input.required<TReceiptItemDto[]>();
  periodId = input.required<number>();
  invAmount = input.required<number>();
  receAmount = input.required<number>();
  canEdit = input(false);
  disabled = input(false);

  private receiptModal = viewChild('receiptModal');

  openReceipt() {
    this.openModal(this.receiptModal());
  }
}