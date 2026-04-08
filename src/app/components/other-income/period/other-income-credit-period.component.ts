import { Component, inject, input, signal } from '@angular/core';
import { TCreditNoteDto } from '../../../service/other-income/base-oi';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BasePeriodComponent } from './base-period.component';
import { PeriodService } from '../../../service/other-income/period.service';

@Component({
  selector: 'app-other-income-credit-period',
  imports: [DecimalPipe, DatePipe],
  template: `
      <div class="mb-3">
        <div class="px-3 py-2 text-muted small fw-semibold border-bottom">ใบลดหนี้</div>
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th scope="col" style="width: 20%;">ใบลดหนี้</th>
              <th scope="col" style="width: 20%;">ยอดใบลดหนี้</th>
              <th scope="col" style="width: 20%;">หมายเหตุ</th>
              <th scope="col" style="width: 20%;">วันที่ใบลดหนี้</th>
              <th scope="col" style="width: 20%;"></th> 
            </tr>
          </thead>
          <tbody>
            @for (credit of creditList(); track credit.id) {
            <tr>
              <td scope="row">{{ credit.creditNumb }}</td>
              <td>{{ credit.creditAmount| number : "1.2-2" }}</td>
              <td>{{ credit.creditRemark }}</td>
              <td>{{ credit.creditDate | date }}</td>
              @if (creditList().at(-1)?.id === credit.id) {
                <td><button class="btn btn-squre btn-danger" (click)="onDelete(credit.id)" [disabled]="deleting() || disabled() || !canEdit()"><i class="bi bi-trash"></i></button></td>
              }@else{<td></td>}
            </tr>
            }
          </tbody>
        </table>
      </div>
  `,
  styles: ''
})
export class OtherIncomeCreditPeriodComponent extends BasePeriodComponent {

  private readonly periodService = inject(PeriodService);

  canEdit = input(false);
  creditList = input.required<TCreditNoteDto[]>();
  periodId = input.required<number>();
  incomeAmount = input.required<number>();
  addedAmount = input.required<number>();
  disabled = input(false);
  deleting = signal(false);

  onDelete(creditId: number) {
    this.deleting.set(true);
    this.periodService.deleteCreditNote(this.periodId(), creditId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.success.emit('ลบใบลดหนี้สำเร็จ');
      },
      error: (err) => {
        this.deleting.set(false);
        this.fail.emit(err?.error?.message ?? 'ลบใบลดหนี้ไม่สำเร็จ');
      }
    });
  }
}
