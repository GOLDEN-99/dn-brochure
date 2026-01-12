import { Component, input, viewChild } from '@angular/core';
import { TCreditNoteDto } from '../../../service/other-income/base-oi';
import { DecimalPipe } from '@angular/common';
import { OtherIncomeCreditModalComponent } from "./other-income-credit-modal.component";
import { BasePeriodComponent } from './base-period.component';

@Component({
  selector: 'app-other-income-credit-period',
  imports: [DecimalPipe, OtherIncomeCreditModalComponent],
  template: `
      <div class="mb-3">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">ใบลดหนี้</th>
              <th scope="col">ยอดใบลดหนี้</th>
              <th scope="col">หมายเหตุ</th>
              <th scope="col">วันที่ใบลดหนี้</th>
              @if(canEdit()){
              <th scope="col">
                  <button
                  class="btn btn-sm btn-primary me-1"
                  (click)="openCredit()"
                  [disabled]="disabled()"
                  >
                  เพิ่มใบลดหนี้
                </button>
              </th>
            }
            </tr>
          </thead>
          <tbody>
            @for (credit of creditList(); track credit.id) {
            <tr>
              <td scope="row">{{ credit.creditNumb }}</td>
              <td>{{ credit.creditAmount| number : "1.2-2" }}</td>
              <td>{{ credit.creditRemark }}</td>
              @if(canEdit()){
                <td colspan="2">{{ credit.creditDate }}</td>
              } @else {
                <td>{{ credit.creditDate }}</td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>

    <ng-template #creditModal let-modal>
      <app-other-income-credit-modal
      [periodId]="periodId()"
      [incomeAmount]="incomeAmount()"
      [addedAmount]="addedAmount()"
      (success)="onSuccess($event)"
      (fail)="onFail($event)"
      (close)="modal.dismiss()" />
    </ng-template>
  `,
  styles: ''
})
export class OtherIncomeCreditPeriodComponent extends BasePeriodComponent {
  canEdit = input(false);
  creditList = input.required<TCreditNoteDto[]>();
  periodId = input.required<number>();
  incomeAmount = input.required<number>();
  addedAmount = input.required<number>();
  disabled = input(false);

  private creditModal = viewChild('creditModal');

  openCredit() {
    this.openModal(this.creditModal());
  }
}
