import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderContractContextService } from '../../../services/order-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { CreateSettlementFormComponent } from '../../forms/create-settlement-form/create-settlement-form.component';
import { CreatePairedSettlementFormComponent } from '../../forms/create-paired-settlement-form/create-paired-settlement-form.component';
import { TPostPairedSettlementReq, TPostSettlementReq } from '../../../../shared/types/other-income.type';

@Component({
  selector: 'app-order-contract-settlements-page',
  imports: [RouterLink, DatePipe, CreateSettlementFormComponent, CreatePairedSettlementFormComponent],
  templateUrl: './order-contract-settlements-page.component.html',
  styleUrl: './order-contract-settlements-page.component.scss',
})
export class OrderContractSettlementsPageComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(OrderContractContextService)

  createSettlementForm = viewChild(CreateSettlementFormComponent)
  submittingSettlement = signal(false)
  openIncomeEntries = computed(() => this.ctx.incomeEntries().filter(e => !e.settlementId))

  pairedSettlementForm = viewChild(CreatePairedSettlementFormComponent)
  submittingPairedSettlement = signal(false)

  onSubmitSettlement(req: TPostSettlementReq): void {
    this.submittingSettlement.set(true)
    this.ctx.addSettlement(req).subscribe({
      next: () => {
        this.toast.success('สร้าง Settlement เรียบร้อย')
        this.createSettlementForm()?.reset()
        this.submittingSettlement.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingSettlement.set(false)
      },
    })
  }

  onSubmitPairedSettlement(req: TPostPairedSettlementReq): void {
    this.submittingPairedSettlement.set(true)
    this.ctx.addPairedSettlement(req).subscribe({
      next: () => {
        this.toast.success('สร้าง Settlement เรียบร้อย')
        this.pairedSettlementForm()?.reset()
        this.submittingPairedSettlement.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingPairedSettlement.set(false)
      },
    })
  }
}
