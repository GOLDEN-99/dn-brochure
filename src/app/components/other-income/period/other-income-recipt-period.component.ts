import { Component, inject, input, output, viewChild } from '@angular/core';
import { TReceiptItemDto } from '../../../service/other-income/base-oi';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OtherIncomeReceiptModalComponent } from './other-income-receipt-modal.component';

@Component({
  selector: 'app-other-income-recipt-period',
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