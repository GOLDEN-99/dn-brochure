import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TInviceItemDto } from '../../../service/other-income/base-oi';
import { BasePeriodComponent } from './base-period.component';
import { PeriodService } from '../../../service/other-income/period.service';

@Component({
  selector: 'app-other-income-invoice-period',
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="mb-3">
        <div class="px-3 py-2 text-muted small fw-semibold border-bottom">ใบแจ้งหนี้</div>
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th scope="col" style="width: 20%;">ใบแจ้งหนี้</th>
              <th scope="col" style="width: 20%;">ยอดใบแจ้งหนี้</th>
              <th scope="col" style="width: 20%;">หมายเหตุ</th>
              <th scope="col" style="width: 20%;">วันที่ใบแจ้งหนี้</th>
              <th scope="col" style="width: 20%;"></th> 
            </tr>
          </thead>
          <tbody>
            @for (inv of invoiceList(); track inv.id) {
            <tr>
              <td scope="row">{{ inv.invNumb }}</td>
              <td>{{ inv.invAmount| number : "1.2-2" }}</td>
              <td>{{ inv.invRemark }}</td>

              <td>{{ inv.invDate |date }}</td>
              @if (invoiceList().at(-1)?.id === inv.id) {
                <td><button class="btn btn-squre btn-danger" (click)="onDelete(inv.id)" [disabled]="deleting() || disabled() || !canEdit()"><i class="bi bi-trash"></i></button></td>
              }@else{<td></td>}

            </tr>
            }
          </tbody>
        </table>
      </div>
  `,
})
export class OtherIncomeInvoicePeriodComponent extends BasePeriodComponent {

  private readonly periodService = inject(PeriodService);

  canEdit = input(false);
  invoiceList = input.required<TInviceItemDto[]>();
  periodId = input.required<number>();
  incomeAmount = input.required<number>();
  addedAmount = input.required<number>();
  disabled = input(false);
  deleting = signal(false);

  onDelete(invoiceId: number) {
    this.deleting.set(true);
    this.periodService.deleteInvoice(this.periodId(), invoiceId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.success.emit('ลบใบแจ้งหนี้สำเร็จ');
      },
      error: (err) => {
        this.deleting.set(false);
        this.fail.emit(err?.error?.message ?? 'ลบใบแจ้งหนี้ไม่สำเร็จ');
      }
    });
  }
}
