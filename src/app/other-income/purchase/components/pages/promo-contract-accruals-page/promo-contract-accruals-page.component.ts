import { Component, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PromoContractContextService } from '../../../services/promo-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { AddPromoAccrualFormComponent } from '../../forms/add-promo-accrual-form/add-promo-accrual-form.component';
import { TPostPromoAccrualReq } from '../../../../shared/types/other-income.type';

@Component({
  selector: 'app-promo-contract-accruals-page',
  imports: [DatePipe, AddPromoAccrualFormComponent],
  templateUrl: './promo-contract-accruals-page.component.html',
  styleUrl: './promo-contract-accruals-page.component.scss',
})
export class PromoContractAccrualsPageComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(PromoContractContextService)

  addPromoAccrualForm = viewChild(AddPromoAccrualFormComponent)
  submittingAddPromoAccrual = signal(false)

  onSubmitAddPromoAccrual(req: TPostPromoAccrualReq): void {
    const contractId = this.ctx.contract()?.id
    if (contractId == null) return
    this.submittingAddPromoAccrual.set(true)
    this.ctx.addPromoAccrual(contractId, req).subscribe({
      next: () => {
        this.toast.success('บันทึกรายได้ Promo เรียบร้อย')
        this.addPromoAccrualForm()?.reset()
        this.submittingAddPromoAccrual.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingAddPromoAccrual.set(false)
      },
    })
  }

  onDeletePromoAccrual(accrualId: number): void {
    this.ctx.deletePromoAccrual(accrualId).subscribe({
      next: () => this.toast.success('ลบรายการเรียบร้อย'),
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }
}
