import { DecimalPipe } from '@angular/common';
import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OtherIncomeInvoiceModalComponent } from './other-income-invoice-modal.component';
import { OtherIncomeReceiptModalComponent } from './other-income-receipt-modal.component';
import { TPeriodResult } from '../../../service/other-income/base-oi';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-other-income-branch-period',
  imports: [FormsModule, DecimalPipe, OtherIncomeInvoiceModalComponent, OtherIncomeReceiptModalComponent],
  template: `
    <div class="mb-3">
      <div class="row" style="justify-content: space-between">
        <h2 class="col-auto">สรุปราย Period light box</h2>
      </div>
      <div style="max-height: 200px; overflow-y: auto">
        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th>รายได้คำนวน</th>
              <th>ยอดใบแจ้งหนี้</th>
              <th>ยอดใบเสร็จรับเงิน</th>
              <th style="min-height: 250px"></th>
            </tr>
          </thead>
          <tbody>
            @for (period of periodList(); track period.id) {
            <tr>
              <td>{{ period.remark }}</td>
              <td>{{ period.totalIncome | number : "1.2-2" }}</td>
              <td>{{ period.invAmount | number : "1.2-2" }}</td>
              <td>{{ period.receAmount | number : "1.2-2" }}</td>
              <td>
                <button
                  class="btn btn-sm btn-primary me-1"
                  (click)="openInvoice(period.id, period.totalIncome)"
                >
                  เพิ่มใบแจ้งหนี้
                </button>
            
                <button
                  class="btn btn-sm btn-secondary"
                  (click)="openReceipt(period.id)"
                >
                  เพิ่มใบเสร็จรับเงิน
                </button>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
          
    <ng-template #invoiceModal let-modal>
      <app-other-income-invoice-modal
        [periodId]="selectPeriodId()"
        [exIncome]="0"
        [paidAmount]="0"
        (success)="onSuccess($event)"
        (fail)="onFail($event)"
        (close)="modal.dismiss()"
      />
    </ng-template>
          
    <ng-template #receiptModal let-modal>
      <app-other-income-receipt-modal
        [periodId]="selectPeriodId()"
        (success)="onSuccess($event)"
        (fail)="onFail($event)"
      />
    </ng-template>
  `,
  styles: '',
})
export class OtherIncomeBranchPeriodComponent {
  periodList = input.required<TPeriodResult[]>()
  success = output<string>()
  fail = output<string>()
  selectPeriodId = signal(0)

  private modalServ = inject(NgbModal)

  private invoiceModal = viewChild('invoiceModal')

  openInvoice(periodId: number, exIncome: number) {
    this.selectPeriodId.set(periodId)
    this.modalServ.open(this.invoiceModal())
  }

  private receiptModal = viewChild('receiptModal')
  openReceipt(periodId: number) {
    this.selectPeriodId.set(periodId)
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
