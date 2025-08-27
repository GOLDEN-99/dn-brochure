import { Component, inject, input, output, viewChild } from '@angular/core';
import { TCreditNoteDto } from '../../../service/other-income/base-oi';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';
import { OtherIncomeCreditModalComponent } from "./other-income-credit-modal.component";

@Component({
  selector: 'app-other-income-credit-period',
  imports: [DecimalPipe, OtherIncomeCreditModalComponent],
  template: `
      <div class="mb-3">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 20%;">ใบลดหนี้</th>
              <th style="width: 20%;">ยอดใบลดหนี้</th>
              <th style="width: 20%;">วันที่ใบลดหนี้</th>
              <th style="width: 20%;">
                <button
                  class="btn btn-sm btn-primary me-1"
                  (click)="openCredit()"
                >
                  เพิ่มใบลดหนี้
                </button></th>
            </tr>
          </thead>
          <tbody>
            @for (credit of creditList(); track credit.id) {
            <tr>
              <td>{{ credit.creditNumb }}</td>
              <td>{{ credit.creditAmount| number : "1.2-2" }}</td>
              <td colspan="2">{{ credit.creditDate }}</td>
            </tr>
            }
          </tbody>
        </table>
      </div>
          
    <ng-template #creditModal let-modal>
      <app-other-income-credit-modal [periodId]="periodId()"  />
    </ng-template>
  `,
  styles: ''
})
export class OtherIncomeCreditPeriodComponent {
  creditList = input.required<TCreditNoteDto[]>()
  periodId = input.required<number>()
  exIncome = input.required<number>()
  discount = input.required<number>()

  success = output<string>()
  fail = output<string>()

  private modalServ = inject(NgbModal)

  private invoiceModal = viewChild('creditModal')

  openCredit() {
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
