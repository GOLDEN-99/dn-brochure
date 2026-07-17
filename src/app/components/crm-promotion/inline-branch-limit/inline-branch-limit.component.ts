import { Component, computed, inject, model } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BranchConfigService } from '../../../service/crm-promotion/branch-config.service';
import { TBranch, TBranchDetail, TConfigGroup } from '../../../types/crm-promotion.type';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../../service/loading/loading.service';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-inline-branch-limit',
  imports: [NgbTypeahead, FormsModule],
  templateUrl: './inline-branch-limit.component.html',
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
  private readonly promotionBranchGroup = this.branchService.allBranchGroup
  readonly renderBranch = computed(() => {
    const currentRef = this.branchRef()
    return this.branchList().filter(b => !currentRef.has(b.branchCode))
  })
  searchBranch = (text$: Observable<string>) =>
    text$.pipe(
      map(
        t =>
          this.renderBranch()
            .filter(
              b => b.branchName.toLocaleLowerCase()
                .includes(t.toLowerCase())
            ).slice(0, 10)
      )
    )
  onSelectBranch = ({ item: { branchCode, branchName } }: NgbTypeaheadSelectItemEvent<TBranchDetail>) => {
    //update data
    this.currentBranch.update(prev => [...prev, { branchCode, branchName }])
  }

  searchPromotionBranchGroup = (text$: Observable<string>) =>
    text$.pipe(
      map(
        t =>
          this.promotionBranchGroup()
            .filter(
              b => b.name.toLocaleLowerCase()
                .includes(t.toLowerCase())
            )
      )
    )

  onSelcetPromotionBranchGroup = ({ item: { id } }: NgbTypeaheadSelectItemEvent<TConfigGroup>) => {
    this.loadingService.startLoad()
    this.branchService.getByGroupId(id).subscribe({
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
      },
      complete: () => {
        this.loadingService.endLoad()
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
