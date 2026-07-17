import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PromoContractContextService } from '../../../services/promo-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { CreateSettlementFormComponent } from '../../forms/create-settlement-form/create-settlement-form.component';
import { TPostSettlementReq } from '../../../../shared/types/other-income.type';

@Component({
  selector: 'app-promo-contract-settlements-page',
  imports: [RouterLink, DatePipe, CreateSettlementFormComponent],
  templateUrl: './promo-contract-settlements-page.component.html',
  styleUrl: './promo-contract-settlements-page.component.scss',
})
export class PromoContractSettlementsPageComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(PromoContractContextService)

  createSettlementForm = viewChild(CreateSettlementFormComponent)
  submittingSettlement = signal(false)
  openIncomeEntries = computed(() => this.ctx.incomeEntries().filter(e => !e.settlementId))

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
}
