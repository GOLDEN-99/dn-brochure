import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { TPeriodResult } from '../../../../service/other-income/base-oi';
import { ToastService } from '../../../../service/toast/toast.service';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { OrderService } from '../../../../service/other-income/order.service';
import { PeriodService } from '../../../../service/other-income/period.service';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateInputComponent } from '../../../date-input/date-input.component';

@Component({
  selector: 'app-other-income-period-account',
  imports: [DecimalPipe, FormsModule, DateInputComponent],
  templateUrl: './other-income-period-account.component.html',
  styleUrl: './other-income-period-account.component.scss'
})
export class OtherIncomePeriodAccountComponent {
  compType = input.required<string | undefined>()
  compCode = input.required<string | undefined>()
  collectedIncome = input(0)
  headId = input.required<number>();
  periodList = input<TPeriodResult[]>([])
  canEdit = input(false)

  private toastServ = inject(ToastService)
  private modalServ = inject(NgbModal)

  private notLightServ = inject(OiNotLightService)
  private periodService = inject(PeriodService)

  private poService = inject(OrderService)
  term = this.poService.term
  orderList = this.poService.queryOrder
  periodId = signal(0)
  invalidPeriodId = computed(() => this.periodId() <= 0)

  private calServ = inject(NgbCalendar)
  private today = this.calServ.getToday()
  private receiptModal = viewChild('receiptModal')
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
    this.periodId.set(periodId);
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
  openReceipt(periodId: number) {
    this.resetReceState(periodId)
    this.modalServ.open(this.receiptModal())
  }
  onInsertRece() {
    const req = this.receReq;
    const periodId = this.periodId();
    this.periodService.insertRece(periodId, req).subscribe({
      next: (res) => {
        console.log(res);
        this.toastServ.success('เพิ่มใบเสร็จสำเร็จ');
        this.notLightServ.refetch();
        this.modalServ.dismissAll();
        this.resetReceState();
      },
      error: (err) => {
        this.toastServ.danger(err.message);
      }
    })
  }

  private invoiceModal = viewChild('invoiceModal')
  invoiceDate = signal(this.today)
  invoiceIncome = signal(0)
  invoiceNumb = signal("")
  invalidInvNumb = computed(() => {
    const numb = this.invoiceNumb();
    return numb === ""
  })
  invoiceAmount = signal(0)
  invalidInvAmou = computed(() => this.invoiceAmount() <= 0)
  withholding = signal(0)
  invalidWhd = computed(() => this.withholding() < 0)
  invoiceDisable = computed(() => this.invalidInvNumb() || this.invalidInvAmou() || this.invalidWhd() || this.invalidPeriodId())

  resetInvState(periodId: number = 0, exIncome: number = 0) {
    this.invoiceDate.set(this.today);
    this.invoiceIncome.set(0);
    this.invoiceNumb.set("");
    this.invoiceAmount.set(0);
    this.withholding.set(0)
    this.periodId.set(periodId);
    this.invoiceIncome.set(exIncome);
  }
  get invReq() {
    const { day, month, year } = this.invoiceDate()
    const invDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const invAmount = this.invoiceAmount()
    const withholding = this.withholding()
    const invNumb = this.invoiceNumb()
    const exIncome = this.invoiceIncome()
    return {
      invDate, invNumb, invAmount, withholding, exIncome
    }
  }
  openInvoice(periodId: number, exIncome: number) {
    this.resetInvState(periodId, exIncome)
    this.modalServ.open(this.invoiceModal())
  }
  onInsertInv() {
    const req = this.invReq;
    const periodId = this.periodId();
    this.periodService.insertInv(periodId, req).subscribe({
      next: (res) => {
        console.log(res);
        this.toastServ.success('เพิ่มใบแจ้งหนี้สำเร็จ');
        this.notLightServ.refetch();
        this.modalServ.dismissAll();
        this.resetInvState();
      },
      error: (err) => {
        this.toastServ.danger(err.message);
      }
    })
  }
}