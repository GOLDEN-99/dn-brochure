import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SettlementContextService } from '../../../../../services/settlement-context.service';
import { ToastService } from '../../../../../../../service/toast/toast.service';
import { AppendInvoiceComponent } from '../../../../forms/append-invoice/append-invoice.component';
import { AppendReceiptComponent, AppendReceiptSubmit } from '../../../../forms/append-receipt/append-receipt.component';
import { TPostInvoiceReq, TPostReceiptWithMatchesReq } from '../../../../../../shared/types/other-income.type';

@Component({
  selector: 'app-settlement-invoice-receipt-tab',
  imports: [DatePipe, AppendInvoiceComponent, AppendReceiptComponent],
  templateUrl: './settlement-invoice-receipt-tab.component.html',
})
export class SettlementInvoiceReceiptTabComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(SettlementContextService)

  /** Remaining open balance for the settlement, used as the invoice-append form's default amount. */
  openSettlementAmount = input.required<number>()

  appendInvoiceForm = viewChild(AppendInvoiceComponent)
  submittingInvoice = signal(false)

  appendReceiptForm = viewChild(AppendReceiptComponent)
  submittingReceipt = signal(false)

  /** Sum of matched amounts per invoiceId/receiptId, derived from settlement.matches (many-to-many join). */
  matchedByInvoiceId = computed(() => {
    const matches = this.ctx.settlement()?.matches ?? []
    const map = new Map<number, number>()
    for (const m of matches) map.set(m.invoiceId, (map.get(m.invoiceId) ?? 0) + m.matchedAmount)
    return map
  })

  matchedByReceiptId = computed(() => {
    const matches = this.ctx.settlement()?.matches ?? []
    const map = new Map<number, number>()
    for (const m of matches) map.set(m.receiptId, (map.get(m.receiptId) ?? 0) + m.matchedAmount)
    return map
  })

  onSubmitInvoice(req: TPostInvoiceReq): void {
    this.submittingInvoice.set(true)
    this.ctx.addInvoice(req).subscribe({
      next: () => {
        this.toast.success('เพิ่มใบแจ้งหนี้เรียบร้อย')
        this.appendInvoiceForm()?.reset()
        this.submittingInvoice.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingInvoice.set(false)
      },
    })
  }

  onDeleteInvoice(itemId: number): void {
    this.ctx.removeInvoice(itemId).subscribe({
      next: () => this.toast.success('ลบรายการเรียบร้อย'),
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }

  onDeleteReceipt(itemId: number): void {
    this.ctx.removeReceipt(itemId).subscribe({
      next: () => this.toast.success('ลบรายการเรียบร้อย'),
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }

  onSubmitReceipt(submission: AppendReceiptSubmit): void {
    this.submittingReceipt.set(true)
    const req: TPostReceiptWithMatchesReq = {
      receipt: submission.receipt,
      invoiceMatches: submission.matches,
    }
    this.ctx.addReceipt(req).subscribe({
      next: () => {
        this.toast.success('เพิ่มใบเสร็จเรียบร้อย')
        this.appendReceiptForm()?.reset()
        this.submittingReceipt.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingReceipt.set(false)
      },
    })
  }
}
