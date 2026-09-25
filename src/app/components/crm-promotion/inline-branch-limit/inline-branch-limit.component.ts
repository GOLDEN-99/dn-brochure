import { Component, computed, inject, model, ChangeDetectionStrategy } from '@angular/core';
import { finalize } from 'rxjs';
import { BranchConfigService } from '../../../service/crm-promotion/branch-config.service';
import { TBranch, TBranchDetail, TConfigGroup } from '../../../types/crm-promotion.type';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../../service/loading/loading.service';
import { ToastService } from '../../../service/toast/toast.service';
import { SearchPickerComponent } from '../search-picker/search-picker.component';

@Component({
  selector: 'app-inline-branch-limit',
  imports: [FormsModule, SearchPickerComponent],
  templateUrl: './inline-branch-limit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './inline-branch-limit.component.scss',
})
export class InlineBranchLimitComponent {
  private readonly loadingService = inject(LoadingService)
  private readonly toastService = inject(ToastService)
  branchLimit = model.required<boolean>()
  currentBranch = model.required<TBranch[]>()
  private readonly branchRef = computed(() => new Set(this.currentBranch().map(b => b.branchCode)))
  allowSelectBranch = computed(() => !this.branchLimit())
  private readonly branchService = inject(BranchConfigService)
  private readonly branchList = this.branchService.allBranches
  readonly promotionBranchGroup = this.branchService.allBranchGroup
  readonly renderBranch = computed(() => {
    const currentRef = this.branchRef()
    return this.branchList().filter(b => !currentRef.has(b.branchCode))
  })
  readonly branchName = (b: TBranchDetail) => b.branchName
  readonly groupName = (g: TConfigGroup) => g.name

  onSelectBranch = ({ branchCode, branchName }: TBranchDetail) => {
    //update data
    this.currentBranch.update(prev => [...prev, { branchCode, branchName }])
  }

  onSelcetPromotionBranchGroup = ({ id }: TConfigGroup) => {
    this.loadingService.startLoad()
    this.branchService.getByGroupId(id).pipe(finalize(() => this.loadingService.endLoad())).subscribe({
      next: (res) => {
        // do update
        const ref = this.branchRef()
        const addedBranch = res.flatMap(
          ({ branchCode, branchName }) =>
            ref.has(branchCode)
              ? []
              : [{ branchName, branchCode }]
        )
        this.currentBranch.update(prev => [
          ...prev,
          ...addedBranch,
        ])
        this.toastService.success(`เพิ่มสาขาสำเร็จ ${addedBranch.length} สาขา`)
      },
      error: (e) => {
        this.toastService.danger('ไม่สามารถเพิ่มสาขาจากกลุ่มได้')
      }
    })
  }

  toggleBranchLimit = (event: boolean) => {
    if (!event) {
      this.currentBranch.set([])
    }
    this.branchLimit.update(_ => event)
  }
}
