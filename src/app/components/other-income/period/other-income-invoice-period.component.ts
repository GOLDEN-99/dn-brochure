import { DecimalPipe } from '@angular/common';
import { Component, inject, input, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OtherIncomeInvoiceModalComponent } from './other-income-invoice-modal.component';
import { TInviceItemDto } from '../../../service/other-income/base-oi';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-other-income-invoice-period',
  imports: [FormsModule, DecimalPipe, OtherIncomeInvoiceModalComponent],
  template: `
    <div class="mb-3">

        <table class="table">
          <thead>
            <tr>
              <th style="width: 20%;">ใบแจ้งหนี้</th>
              <th style="width: 20%;">ยอดใบแจ้งหนี้</th>
              <th style="width: 20%;">หัก ณ ที่จ่าย</th>
              <th style="width: 20%;">วันที่ใบแจ้งหนี้</th>
              <th style="width: 20%;">
                <button
                  class="btn btn-sm btn-primary me-1"
                  (click)="openInvoice()"
                >
                  เพิ่มใบแจ้งหนี้
                </button></th>
            </tr>
          </thead>
          <tbody>
            @for (inv of invoiceList(); track inv.id) {
            <tr>
              <td>{{ inv.invNumb }}</td>
              <td>{{ inv.invAmount| number : "1.2-2" }}</td>
              <td>{{ inv.withholding | number : "1.2-2" }}</td>
              <td colspan="2">{{ inv.invDate }}</td>
            </tr>
            }
          </tbody>
        </table>
      </div>
          
    <ng-template #invoiceModal let-modal>
      <app-other-income-invoice-modal
        [periodId]="periodId()"
        [exIncome]="exIncome()"
        [paidAmount]="discount()"
        (success)="onSuccess($event)"
        (fail)="onFail($event)"
        (close)="modal.dismiss()"
      />
    </ng-template>
  `,
})
export class OtherIncomeInvoicePeriodComponent {
  invoiceList = input.required<TInviceItemDto[]>()
  periodId = input.required<number>()
  exIncome = input.required<number>()
  discount = input.required<number>()

  success = output<string>()
  fail = output<string>()

  private modalServ = inject(NgbModal)

  private invoiceModal = viewChild('invoiceModal')

  openInvoice() {
    this.modalServ.open(this.invoiceModal())
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
