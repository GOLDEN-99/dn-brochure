import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BranchContractContextService } from '../../../services/branch-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { AddBranchFormComponent } from '../../forms/add-branch-form/add-branch-form.component';
import { CreateSettlementFormComponent } from '../../forms/create-settlement-form/create-settlement-form.component';
import { TAddBranchReq, TPostSettlementReq } from '../../../../shared/types/other-income.type';

@Component({
  selector: 'app-branch-contract-detail-page',
  imports: [RouterLink, DatePipe, AddBranchFormComponent, CreateSettlementFormComponent],
  templateUrl: './branch-contract-detail-page.component.html',
  styleUrl: './branch-contract-detail-page.component.scss',
})
export class BranchContractDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly toast = inject(ToastService)
  readonly ctx = inject(BranchContractContextService)

  addBranchForm = viewChild(AddBranchFormComponent)
  submittingAddBranch = signal(false)

  createSettlementForm = viewChild(CreateSettlementFormComponent)
  submittingSettlement = signal(false)
  openIncomeEntries = computed(() => this.ctx.incomeEntries().filter(e => !e.settlementId))

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['id']);
  }

  onSubmitAddBranch(req: TAddBranchReq): void {
    const contractId = this.ctx.contract()?.id
    if (contractId == null) return
    this.submittingAddBranch.set(true)
    this.ctx.addBranch(contractId, req).subscribe({
      next: () => {
        this.toast.success('เพิ่มสาขาเรียบร้อย')
        this.addBranchForm()?.reset()
        this.submittingAddBranch.set(false)
      },
      error: (err) => {
        this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด')
        this.submittingAddBranch.set(false)
      },
    })
  }

  onCloseBranch(entryId: number, closeDate: string): void {
    const contractId = this.ctx.contract()?.id
    if (contractId == null) return
    this.ctx.closeBranch(contractId, entryId, { closeDate }).subscribe({
      next: () => this.toast.success('ปิดสาขาเรียบร้อย'),
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
