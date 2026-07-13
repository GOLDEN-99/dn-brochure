import { Component, inject, input, signal, viewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { SettlementContextService } from '../../../../../services/settlement-context.service';
import { ToastService } from '../../../../../../../service/toast/toast.service';
import { AppendBillDiscountComponent, TBillDiscountSearchFilters } from '../../../../forms/append-bill-discount/append-bill-discount.component';
import { TBillDiscountOrderLine, TPostBillDiscountReq } from '../../../../../../shared/types/other-income.type';

type SearchBillDiscounts = (filters: TBillDiscountSearchFilters) => Observable<TBillDiscountOrderLine[]>

@Component({
  selector: 'app-settlement-bill-tab',
  imports: [AppendBillDiscountComponent],
  templateUrl: './settlement-bill-tab.component.html',
})
export class SettlementBillTabComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(SettlementContextService)

  search = input.required<SearchBillDiscounts>()
  canAppend = input(false)

  appendBillDiscountForm = viewChild(AppendBillDiscountComponent)
  submittingBillDiscount = signal(false)

  onSubmitBillDiscounts(reqs: TPostBillDiscountReq[]): void {
    if (reqs.length === 0) return
    this.submittingBillDiscount.set(true)
    this.ctx.addBillDiscounts(reqs).subscribe({
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
}
