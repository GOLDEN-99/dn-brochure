import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DateInputComponent } from "../../date-input/date-input.component";
import { FormsModule } from '@angular/forms';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { PeriodService } from '../../../service/other-income/period.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-other-income-invoice-modal',
  imports: [DateInputComponent, FormsModule, DecimalPipe],
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
      <app-date-input [(date)]="invoiceDate" label="วันที่ใบแจ้งหนี้" />
      <div class="row mb-3">
        <div class="col">รายได้บันทึก</div>
        <div class="col">{{ incomeAmount() | number : "1.2-2" }}</div>
      </div>
      <div class="row mb-3">
        <div class="col">ยอดใบแจ้งหนี้ที่เพิ่มแล้ว</div>
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
            [(ngModel)]="invoiceNumb"
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
            [(ngModel)]="invoiceAmount"
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
            [(ngModel)]="invoiceRemark"
          />
        </div>
      </div>

    </div>
    <div class="modal-footer">
      <button
        class="btn btn-primary w-100"
        [disabled]="invoiceDisable()"
        (click)="onInsertInv()"
      >
        บันทึก
      </button>
    </div>
  `,
  styles: '',
})
export class OtherIncomeInvoiceModalComponent {
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

  invoiceDate = signal(this.today)
  invoiceNumb = signal("")
  invalidInvNumb = computed(() => {
    const numb = this.invoiceNumb();
    return numb === ""
  })
  invoiceAmount = signal(0)
  invalidInvAmou = computed(() => this.invoiceAmount() <= 0)
  invoiceDisable = computed(() => this.invalidInvNumb() || this.invalidInvAmou() || this.invalidPeriodId())
  invoiceRemark = signal("")

  resetInvState() {
    this.invoiceDate.set(this.today);
    this.invoiceNumb.set("");
    this.invoiceAmount.set(0);
    this.invoiceRemark.set("")
  }
  get invReq() {
    const { day, month, year } = this.invoiceDate()
    const invDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const invAmount = this.invoiceAmount()
    const invNumb = this.invoiceNumb()
    const invRemark = this.invoiceRemark()
    return {
      invDate, invNumb, invAmount, invRemark
    }
  }

  onInsertInv() {
    const req = this.invReq;
    const periodId = this.periodId();
    this.periodService.insertInv(periodId, req).subscribe({
      next: (res) => {
        console.log(res);
        this.success.emit('เพิ่มใบแจ้งหนี้สำเร็จ');
        this.resetInvState();
      },
      error: (err) => {
        this.fail.emit(err.message);
      }
    })
  }
}
