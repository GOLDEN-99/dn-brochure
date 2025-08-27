import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PeriodService } from '../../../service/other-income/period.service';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-other-income-credit-modal',
  imports: [FormsModule],
  template: `
  `,
  styles: ''
})
export class OtherIncomeCreditModalComponent {
  periodId = input.required<number>()
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
