import { Component, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrderContractContextService } from '../../../services/order-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { CnCorrectionFormComponent } from '../../forms/cn-correction-form/cn-correction-form.component';
import { LagCorrectionFormComponent } from '../../forms/lag-correction-form/lag-correction-form.component';
import { ManualCorrectionFormComponent } from '../../forms/manual-correction-form/manual-correction-form.component';
import { TPostCnCorrectionReq, TPostLagCorrectionReq, TPostManualCorrectionReq } from '../../../../shared/types/other-income.type';

@Component({
  selector: 'app-order-contract-accruals-page',
  imports: [DatePipe, CnCorrectionFormComponent, LagCorrectionFormComponent, ManualCorrectionFormComponent],
  templateUrl: './order-contract-accruals-page.component.html',
  styleUrl: './order-contract-accruals-page.component.scss',
})
export class OrderContractAccrualsPageComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(OrderContractContextService)

  cnCorrectionForm = viewChild(CnCorrectionFormComponent)
  submittingCnCorrection = signal(false)

  lagCorrectionForm = viewChild(LagCorrectionFormComponent)
  submittingLagCorrection = signal(false)

  manualCorrectionForm = viewChild(ManualCorrectionFormComponent)
  submittingManualCorrection = signal(false)

  onSubmitCnCorrection(req: TPostCnCorrectionReq): void {
    this.submittingCnCorrection.set(true)
    this.ctx.addCnCorrection(req.contractId, req).subscribe({
      next: () => {
        this.toast.success('บันทึก CN เรียบร้อย')
        this.cnCorrectionForm()?.reset()
        this.submittingCnCorrection.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingCnCorrection.set(false)
      },
    })
  }

  onSubmitLagCorrection(req: TPostLagCorrectionReq): void {
    this.submittingLagCorrection.set(true)
    this.ctx.addLagCorrection(req.contractId, req).subscribe({
      next: () => {
        this.toast.success('บันทึก Lag Correction เรียบร้อย')
        this.lagCorrectionForm()?.reset()
        this.submittingLagCorrection.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingLagCorrection.set(false)
      },
    })
  }

  onSubmitManualCorrection(req: TPostManualCorrectionReq): void {
    this.submittingManualCorrection.set(true)
    this.ctx.addManualCorrection(req).subscribe({
      next: () => {
        this.toast.success('บันทึก Manual Correction เรียบร้อย')
        this.manualCorrectionForm()?.reset()
        this.submittingManualCorrection.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingManualCorrection.set(false)
      },
    })
  }
}
