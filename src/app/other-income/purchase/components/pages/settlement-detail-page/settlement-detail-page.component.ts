import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { SettlementContextService } from '../../../services/settlement-context.service';
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { AppendBillDiscountComponent } from '../../forms/append-bill-discount/append-bill-discount.component';
import { AppendFreeItemComponent } from '../../forms/append-free-item/append-free-item.component';
import { AppendCreditNoteComponent } from '../../forms/append-credit-note/append-credit-note.component';
import { AppendInvoiceComponent } from '../../forms/append-invoice/append-invoice.component';
import { AppendReceiptComponent, AppendReceiptSubmit } from '../../forms/append-receipt/append-receipt.component';
import { TPostBillDiscountReq, TPostCreditNoteReq, TPostFreeItemReq, TPostInvoiceReq } from '../../../../shared/types/other-income.type';
import { FOR_CONTRACT_DATA_TOKEN } from '../../../../tokens/service-token';

@Component({
  selector: 'app-settlement-detail-page',
  imports: [DatePipe, AppendBillDiscountComponent, AppendFreeItemComponent, AppendCreditNoteComponent, AppendInvoiceComponent, AppendReceiptComponent],
  templateUrl: './settlement-detail-page.component.html',
  styleUrl: './settlement-detail-page.component.scss',
})
export class SettlementDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly location = inject(Location)
  private readonly toast = inject(ToastService)
  private readonly api = inject(OtherIncomePurchaseApiService)
  readonly ctx = inject(SettlementContextService)
  private readonly headService = inject(FOR_CONTRACT_DATA_TOKEN)

  appendBillDiscountForm = viewChild(AppendBillDiscountComponent)
  submittingBillDiscount = signal(false)

  appendFreeItemForm = viewChild(AppendFreeItemComponent)
  submittingFreeItem = signal(false)

  appendCreditNoteForm = viewChild(AppendCreditNoteComponent)
  submittingCreditNote = signal(false)

  appendInvoiceForm = viewChild(AppendInvoiceComponent)
  submittingInvoice = signal(false)

  appendReceiptForm = viewChild(AppendReceiptComponent)
  submittingReceipt = signal(false)

  /**
   * GET /v2/settlements/{id} doesn't carry compCode/compType, so once the settlement loads
   * (giving us contractId/contractType), fetch the parent contract separately to get them.
   */
  private readonly contractComp = computed(() => {
    const head = this.headService.contract()
    if (!head) return null
    const { compCode, compType } = head
    return { compCode, compType }
  })

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

  searchBillDiscounts = (filters: Omit<Parameters<typeof this.api.searchBillDiscounts>[0], 'compType' | 'compCode'>) => {
    const comp = this.contractComp()
    if (!comp) throw new Error('Contract company info not loaded yet')
    return this.api.searchBillDiscounts({ ...filters, ...comp })
  }

  searchFreeProducts = (filters: Omit<Parameters<typeof this.api.searchFreeProducts>[0], 'compType' | 'compCode'>) => {
    const comp = this.contractComp()
    if (!comp) throw new Error('Contract company info not loaded yet')
    return this.api.searchFreeProducts({ ...filters, ...comp })
  }

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['settlementId']);
  }



  onSubmitBillDiscounts(reqs: TPostBillDiscountReq[]): void {
    if (reqs.length === 0) return
    this.submittingBillDiscount.set(true)
    forkJoin(reqs.map(req => this.ctx.addBillDiscount(req))).subscribe({
      next: () => {
        this.toast.success('เพิ่มส่วนลดบิลเรียบร้อย')
        this.appendBillDiscountForm()?.reset()
        this.submittingBillDiscount.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingBillDiscount.set(false)
      },
    })
  }

  onDeleteBillDiscount(itemId: number): void {
    this.ctx.removeBillDiscount(itemId).subscribe({
      next: () => this.toast.success('ลบรายการเรียบร้อย'),
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }

  onSubmitFreeItems(reqs: TPostFreeItemReq[]): void {
    if (reqs.length === 0) return
    this.submittingFreeItem.set(true)
    forkJoin(reqs.map(req => this.ctx.addFreeItem(req))).subscribe({
      next: () => {
        this.toast.success('เพิ่มของแถมเรียบร้อย')
        this.appendFreeItemForm()?.reset()
        this.submittingFreeItem.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingFreeItem.set(false)
      },
    })
  }

  onDeleteFreeItem(itemId: number): void {
    this.ctx.removeFreeItem(itemId).subscribe({
      next: () => this.toast.success('ลบรายการเรียบร้อย'),
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }

  onSubmitCreditNote(req: TPostCreditNoteReq): void {
    this.submittingCreditNote.set(true)
    this.ctx.addCreditNote(req).subscribe({
      next: () => {
        this.toast.success('เพิ่มใบลดหนี้เรียบร้อย')
        this.appendCreditNoteForm()?.reset()
        this.submittingCreditNote.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingCreditNote.set(false)
      },
    })
  }

  onDeleteCreditNote(itemId: number): void {
    this.ctx.removeCreditNote(itemId).subscribe({
      next: () => this.toast.success('ลบรายการเรียบร้อย'),
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }

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

  /**
   * TODO: v2 has no combined receipt+match endpoint — needs postReceipt then postMatch
   * chained with the new receipt id (and rollback/toast handling if the second call fails)
   * before this can actually submit. Blocked pending that API-call design.
   */
  onSubmitReceipt(_submission: AppendReceiptSubmit): void {
    this.toast.danger('ยังไม่รองรับการเพิ่มใบเสร็จพร้อมจับคู่ในขณะนี้')
  }
}
