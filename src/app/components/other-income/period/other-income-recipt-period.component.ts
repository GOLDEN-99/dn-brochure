import { Component, inject, input, output, viewChild } from '@angular/core';
import { TReceiptItemDto } from '../../../service/other-income/base-oi';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { OtherIncomeReceiptModalComponent } from './other-income-receipt-modal.component';

@Component({
  selector: 'app-other-income-recipt-period',
  imports: [FormsModule, DecimalPipe, OtherIncomeReceiptModalComponent],
  template: `
    <div class="mb-3">

        <table class="table">
          <thead>
            <tr>
              <th style="width: 20%;">เลขใบเสร็จ</th>
              <th style="width: 20%;">ยอดใบเสร็จ</th>
              <th style="width: 20%;">หมายเหตุ</th>
              <th style="width: 20%;">วันที่ใบเสร็จ</th>
              <th style="width: 20%;">
                @if(canEdit()){
                  <button
                  class="btn btn-sm btn-secondary"
                  (click)="openReceipt()"
                  >
                  เพิ่มใบเสร็จรับเงิน
                </button>
              }
              </th>
            </tr>
          </thead>
          <tbody>
            @for (inv of receiptList(); track inv.id) {
            <tr>
              <td>{{ inv.receNumb }}</td>
              <td>{{ inv.receAmount| number : "1.2-2" }}</td>
              <td>{{ inv.receRemark  }}</td>
              <td colspan="2">{{ inv.receDate }}</td>
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
export class OtherIncomeReciptPeriodComponent {
  receiptList = input.required<TReceiptItemDto[]>()
  periodId = input.required<number>()
  invAmount = input.required<number>()
  receAmount = input.required<number>()
  canEdit = input(false)
  success = output<string>()
  fail = output<string>()

  private modalServ = inject(NgbModal)

  private receiptModal = viewChild('receiptModal')
  openReceipt() {
    this.modalServ.open(this.receiptModal())
  }

  onSuccess(value: string) {
    this.modalServ.dismissAll()
    this.success.emit(value);
  }

  onFail(value: string) {
    this.modalServ.dismissAll()
    this.fail.emit(value);
  }
}