import { Component, computed, inject, signal } from '@angular/core';
import { CrmGroupService } from '../../../../service/crm-promotion/crm-group.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { BranchConfigService } from '../../../../service/crm-promotion/branch-config.service';

@Component({
  selector: 'app-create-branch-config',
  imports: [RouterLink, FormsModule],
  templateUrl: './create-branch-config.component.html',
  styleUrl: './create-branch-config.component.scss'
})
export class CreateBranchConfigComponent {
  private readonly toastService = inject(ToastService)
  private readonly crmGroupService = inject(BranchConfigService)
  private readonly branchGroup = this.crmGroupService.allBranchGroup
  disabled = signal(false)
  canNotAdd = computed(() => this.serachTerm() === "" || this.renderGroup().length !== 0 || this.disabled())
  serachTerm = signal('')
  renderGroup = computed(() => {
    const term = this.serachTerm().toLocaleLowerCase()
    return this.branchGroup().filter(group =>
      group.name.toLocaleLowerCase().includes(term)
    )
  })
  onCreate() {
    this.disabled.set(true)
    const name = this.serachTerm()
    this.crmGroupService.createBranchGroup({ name }).subscribe({
      next: res => {
        this.toastService.success('เพิ่มกลุ่มสำเร็จ')
        this.crmGroupService.refetchBranchGroup()
      },
      error: err => {
        this.toastService.danger('เกิดข้อผิดพลาดในการเพิ่มกลุ่ม')
        this.crmGroupService.refetchBranchGroup()
      },
      complete: () => {
        this.disabled.set(false)
      }
    })
  }

  onEdit(id: number) {

  }

  onDelete(id: number) {

  }
}
