import { Component, inject, input, signal, viewChild } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { SettlementContextService } from '../../../../../services/settlement-context.service';
import { ToastService } from '../../../../../../../service/toast/toast.service';
import { AppendFreeItemComponent, TFreeItemSearchFilters } from '../../../../forms/append-free-item/append-free-item.component';
import { TFreeItemOrderLine, TPostFreeItemReq } from '../../../../../../shared/types/other-income.type';

type SearchFreeItems = (filters: TFreeItemSearchFilters) => Observable<TFreeItemOrderLine[]>

@Component({
  selector: 'app-settlement-free-item-tab',
  imports: [AppendFreeItemComponent],
  templateUrl: './settlement-free-item-tab.component.html',
})
export class SettlementFreeItemTabComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(SettlementContextService)

  search = input.required<SearchFreeItems>()
  canAppend = input(false)

  appendFreeItemForm = viewChild(AppendFreeItemComponent)
  submittingFreeItem = signal(false)

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
}
