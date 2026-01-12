import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OtherIncomeInvoiceModalComponent } from './other-income-invoice-modal.component';
import { TInviceItemDto } from '../../../service/other-income/base-oi';
import { BasePeriodComponent } from './base-period.component';

@Component({
  selector: 'app-other-income-invoice-period',
  imports: [FormsModule, DecimalPipe, OtherIncomeInvoiceModalComponent, DatePipe],
  template: `
    <div class="mb-3">

        <table class="table">
          <thead>
            <tr>
              <th scope="col">ใบแจ้งหนี้</th>
              <th scope="col">ยอดใบแจ้งหนี้</th>
              <th scope="col">หมายเหตุ</th>
              <th scope="col">วันที่ใบแจ้งหนี้</th>
              @if(canEdit()){
              <th scope="col">
                  <button
                  class="btn btn-sm btn-primary me-1"
                  (click)="openInvoice()"
                  [disabled]="disabled()"
                  >
                  เพิ่มใบแจ้งหนี้
                </button>
              </th>
            }
            </tr>
          </thead>
          <tbody>
            @for (inv of invoiceList(); track inv.id) {
            <tr>
              <td scope="row">{{ inv.invNumb }}</td>
              <td>{{ inv.invAmount| number : "1.2-2" }}</td>
              <td>{{ inv.invRemark }}</td>
              @if(canEdit()){
                <td colspan="2">{{ inv.invDate |date }}</td>
              } @else {
                <td>{{ inv.invDate |date }}</td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>

    <ng-template #invoiceModal let-modal>
      <app-other-income-invoice-modal
        [periodId]="periodId()"
        [incomeAmount]="incomeAmount()"
        [addedAmount]="addedAmount()"
        (success)="onSuccess($event)"
        (fail)="onFail($event)"
        (close)="modal.dismiss()"
      />
    </ng-template>
  `,
})
export class OtherIncomeInvoicePeriodComponent extends BasePeriodComponent {
  canEdit = input(false);
  invoiceList = input.required<TInviceItemDto[]>();
  periodId = input.required<number>();
  incomeAmount = input.required<number>();
  addedAmount = input.required<number>();
  disabled = input(false);

  private invoiceModal = viewChild('invoiceModal');

  openInvoice() {
    this.openModal(this.invoiceModal());
  }
}
