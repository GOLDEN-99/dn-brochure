import { Component, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SettlementContextService } from '../../../../../services/settlement-context.service';
import { ToastService } from '../../../../../../../service/toast/toast.service';
import { AppendCreditNoteComponent } from '../../../../forms/append-credit-note/append-credit-note.component';
import { TPostCreditNoteReq } from '../../../../../../shared/types/other-income.type';

@Component({
  selector: 'app-settlement-credit-note-tab',
  imports: [DatePipe, AppendCreditNoteComponent],
  templateUrl: './settlement-credit-note-tab.component.html',
})
export class SettlementCreditNoteTabComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(SettlementContextService)

  appendCreditNoteForm = viewChild(AppendCreditNoteComponent)
  submittingCreditNote = signal(false)

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
}
