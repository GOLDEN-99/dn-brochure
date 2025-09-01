import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PeriodService } from '../../../service/other-income/period.service';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';
import { DateInputComponent } from "../../date-input/date-input.component";

@Component({
  selector: 'app-other-income-credit-modal',
  imports: [FormsModule, DecimalPipe, DateInputComponent],
  template: `
      <div class="modal-header">
      <h4 class="modal-title">เพิ่มใบแจ้งหนี้</h4>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="close.emit()"
      ></button>
    </div>
    <div class="modal-body">
      <app-date-input [(date)]="creditDate" label="วันที่ใบแจ้งหนี้" />
      <div class="row mb-3">
        <div class="col">รายได้บันทึก</div>
        <div class="col">{{ incomeAmount() | number : "1.2-2" }}</div>
      </div>
      <div class="row mb-3">
        <div class="col">ยอดใบลดหนี้ที่เพิ่มแล้ว</div>
        <div class="col">{{ addedAmount() | number : "1.2-2" }}</div>
      </div>
      <div class="row mb-3">
        <div class="col">ส่วนต่าง</div>
        <div class="col">{{ remainAmount() | number : "1.2-2" }}</div>
      </div>
      <div class="app-form-field-inline">
        <div style="flex: 1"><label for="inv-numb">เลขที่ใบแจ้งหนี้</label></div>
        <div style="flex: 1">
          <input
            type="text"
            id="inv-numb"
            name="inv-numb"
            [(ngModel)]="creditNumb"
          />
        </div>
      </div>
      <div class="app-form-field-inline">
        <div style="flex: 1"><label for="inv-amou">ยอดใบแจ้งหนี้</label></div>
        <div style="flex: 1">
          <input
            type="number"
            id="inv-amou"
            name="inv-amou"
            [(ngModel)]="creditAmount"
          />
        </div>
      </div>
            <div class="app-form-field-inline">
        <div style="flex: 1"><label for="inv-rema">หมายเหตุ</label></div>
        <div style="flex: 1">
          <input
            type="text"
            id="inv-rema"
            name="inv-rema"
            [(ngModel)]="creditRemark"
          />
        </div>
      </div>

    </div>
    <div class="modal-footer">
      <button
        class="btn btn-primary w-100"
        [disabled]="creditDisable()"
        (click)="onInsertInv()"
      >
        บันทึก
      </button>
    </div>
  `,
  styles: ''
})
export class OtherIncomeCreditModalComponent {
  periodId = input.required<number>()
  incomeAmount = input.required<number>()
  addedAmount = input.required<number>()
  remainAmount = computed(() => this.incomeAmount() - this.addedAmount())
  success = output<string>()
  fail = output<string>()
  close = output<void>()

  invalidPeriodId = computed(() => this.periodId() <= 0)

  private periodService = inject(PeriodService)

  private calServ = inject(NgbCalendar)
  private today = this.calServ.getToday()

  creditDate = signal(this.today)
  creditNumb = signal("")
  invalidCreditNumb = computed(() => {
    const numb = this.creditNumb();
    return numb === ""
  })
  creditAmount = signal(0)
  invalidInvAmou = computed(() => this.creditAmount() <= 0)
  creditRemark = signal("")
  creditDisable = computed(() => this.invalidCreditNumb() || this.invalidInvAmou() || this.invalidPeriodId())

  resetInvState() {
    this.creditDate.set(this.today);
    this.creditNumb.set("");
    this.creditAmount.set(0);
  }
  get creditReq() {
    const { day, month, year } = this.creditDate()
    const creditDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const creditAmount = this.creditAmount()
    const creditNumb = this.creditNumb()
    const creditRemark = this.creditRemark()
    return {
      creditDate, creditNumb, creditAmount, creditRemark
    }
  }

  onInsertInv() {
    const req = this.creditReq;
    const periodId = this.periodId();
    this.periodService.insertCredit(periodId, req).subscribe({
      next: (res) => {
        console.log(res);
        this.success.emit('เพิ่มใบลดหนี้สำเร็จ');
        this.resetInvState();
      },
      error: (err) => {
        this.fail.emit(err.message);
      }
    })
  }
}
