import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PromoContractContextService } from '../../../services/promo-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { AddPromoAccrualFormComponent } from '../../forms/add-promo-accrual-form/add-promo-accrual-form.component';
import { CreateSettlementFormComponent } from '../../forms/create-settlement-form/create-settlement-form.component';
import { TPostPromoAccrualReq, TPostSettlementReq } from '../../../../shared/types/other-income.type';

@Component({
  selector: 'app-promo-contract-detail-page',
  imports: [RouterLink, DatePipe, AddPromoAccrualFormComponent, CreateSettlementFormComponent],
  templateUrl: './promo-contract-detail-page.component.html',
  styleUrl: './promo-contract-detail-page.component.scss',
})
export class PromoContractDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly toast = inject(ToastService)
  readonly ctx = inject(PromoContractContextService)

  addPromoAccrualForm = viewChild(AddPromoAccrualFormComponent)
  submittingAddPromoAccrual = signal(false)

  createSettlementForm = viewChild(CreateSettlementFormComponent)
  submittingSettlement = signal(false)
  openIncomeEntries = computed(() => this.ctx.incomeEntries().filter(e => !e.settlementId))

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['id']);
  }

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
