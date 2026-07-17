import { Component, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BranchContractContextService } from '../../../../purchase/services/branch-contract-context.service';
import { AddBranchFormComponent } from '../../add-branch-form/add-branch-form.component';
import { ToastService } from '../../../../../service/toast/toast.service';
import { TAddBranchReq } from '../../../types/other-income.type';

@Component({
  selector: 'app-branch-contract-specs-page',
  imports: [DatePipe, AddBranchFormComponent],
  templateUrl: './branch-contract-specs-page.component.html',
  styles: '',
})
export class BranchContractSpecsPageComponent {
  private readonly toast = inject(ToastService)
  readonly ctx = inject(BranchContractContextService)

  addBranchForm = viewChild(AddBranchFormComponent)
  submittingAddBranch = signal(false)

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

}
