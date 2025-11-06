import { Component, inject, signal } from '@angular/core';
import { DateInputComponent } from "../../../components/date-input/date-input.component";
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quota-item-whole-list',
  imports: [DateInputComponent, DatePipe],
  templateUrl: './quota-item-whole-list.component.html',
  styleUrl: './quota-item-whole-list.component.scss'
})
export class QuotaItemWholeListComponent {
  private calendar = inject(NgbCalendar)
  private today = this.calendar.getToday();
  fromDate = signal(this.today)
  toDate = signal(this.calendar.getNext(this.today, 'd', 7))

  wholeQuotaList = signal<TWholeQuota[]>([
    { wholeCode: '552', wholeName: 'บ้านยาทดสอบ', barCode: '999001', goodName: 'สินค้าทดสอบ 1', goodCode: 'code-1234', quotaAmount: 20, useQuotaAmount: 8, useBefore: '2025-12-01' }
  ])
}


type TWholeQuota = {
  wholeCode: string
  wholeName: string
  barCode: string
  goodCode: string
  goodName: string
  quotaAmount: number
  useQuotaAmount: number
  useBefore: string
}