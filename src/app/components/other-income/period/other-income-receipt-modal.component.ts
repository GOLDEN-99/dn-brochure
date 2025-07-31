import { Component, computed, inject, input, output, signal } from '@angular/core';
import { PeriodService } from '../../../service/other-income/period.service';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { DateInputComponent } from "../../date-input/date-input.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-other-income-receipt-modal',
  imports: [DateInputComponent, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">เพิ่มใบเสร็จ</h4>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="close.emit()"
      ></button>
    </div>
    <div class="modal-body">
      <app-date-input [(date)]="receiptDate" label="วันที่ใบเสร็จรับเงิน" />
      <div class="app-form-field-inline">
        <div style="flex: 1">
          <label for="rece-numb">เลขที่ใบเสร็จรับเงิน</label>
        </div>
        <div style="flex: 1">
          <input
            type="text"
            id="rece-numb"
            name="rece-numb"
            [(ngModel)]="receiptNumb"
          />
        </div>
      </div>
      <div class="app-form-field-inline">
        <div style="flex: 1">
          <label for="rece-amou">ยอดใบเสร็จรับเงิน</label>
        </div>
        <div style="flex: 1">
          <input
            type="number"
            id="rece-amou"
            name="rece-amou"
            [(ngModel)]="receiptAmount"
          />
        </div>
      </div>
      <div class="app-form-field-inline">
        <div style="flex: 1"><label for="rece-remark">หมายเหตุ</label></div>
        <div style="flex: 1">
          <input
            type="text"
            id="rece-remark"
            name="rece-remark"
            [(ngModel)]="receiptRemark"
          />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary w-100" (click)="onInsertRece()">บันทึก</button>
    </div>
  `,
  styles: ''
})
export class OtherIncomeReceiptModalComponent {

  periodId = input.required<number>()
  success = output<string>()
  fail = output<string>()
  close = output<void>()

  invalidPeriodId = computed(() => this.periodId() <= 0)

  private periodService = inject(PeriodService)

  private calServ = inject(NgbCalendar)
  private today = this.calServ.getToday()
  receiptDate = signal(this.today)
  reciptInv = signal(0)
  receiptAmount = signal(0)
  receiptNumb = signal("")
  receiptRemark = signal("")

  resetReceState(periodId = 0) {
    this.receiptDate.set(this.today);
    this.receiptAmount.set(0);
    this.receiptNumb.set("");
    this.receiptRemark.set("");
  }

  get receReq() {
    const { day, month, year } = this.receiptDate()
    const receDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const receNumb = this.receiptNumb();
    const receAmount = this.receiptAmount();
    const receRemark = this.receiptRemark();
    return {
      receDate, receNumb, receAmount, receRemark
    }
  }

  onInsertRece() {
    const req = this.receReq;
    const periodId = this.periodId();
    this.periodService.insertRece(periodId, req).subscribe({
      next: (res) => {
        console.log(res);
        this.success.emit('เพิ่มใบเสร็จสำเร็จ');
        this.resetReceState();
      },
      error: (err) => {
        this.fail.emit(err.message);
      }
    })
  }
}
