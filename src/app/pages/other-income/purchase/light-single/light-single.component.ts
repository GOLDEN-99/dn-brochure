import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { OiLightService } from '../../../../service/other-income/oi-light.service';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeLightEditComponent } from '../../../../components/other-income/edit/other-income-light-edit.component';
import { OtherIncomeBranchComponent } from '../../../../components/other-income/edit/other-income-branch/other-income-branch.component';
import { ToastService } from '../../../../service/toast/toast.service';
import { OTHER_INCOME_PAGE_TOKEN } from '../../../../lib';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OiLightListService } from '../../../../service/other-income/oi-light-list.service';
@Component({
  selector: 'app-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeLightEditComponent,
    OtherIncomeBranchComponent,
    RouterLink,
  ],
  templateUrl: './light-single.component.html'
})
export class LightSingleComponent {
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly toastService = inject(ToastService)
  private readonly modalServ = inject(NgbModal)
  private readonly pageToken = inject(OTHER_INCOME_PAGE_TOKEN)
  isPurchase = this.pageToken.isPurchase

  private readonly lightServ = inject(OiLightService)
  private readonly lightList = inject(OiLightListService)

  private readonly deleteModal = viewChild('deleteModal')
  deleting = signal(false)

  data = this.lightServ.singleRecord
  invalidValue = computed(() => this.data().length !== 1)
  currentResult = computed(() => this.data()[0])

  branchList = computed(() => this.currentResult().branchList)
  incomeList = computed(() => this.currentResult().incomeList)
  periodList = computed(() => this.currentResult().periodList)
  periodId = computed(() => this.periodList()[0]?.id ?? -1)

  onRefetch() {
    this.lightServ.refetch();
    this.lightList.refetch();
  }

  onSuccess(value: string) {
    this.toastService.success(value);
    this.lightServ.refetch();
    this.lightList.refetch();
  }

  onFail(value: string) {
    this.toastService.danger(value);
  }

  onDelete() {
    const headId = this.currentResult()?.head?.id
    if (!headId) {
      this.toastService.danger('ไม่สามารถลบข้อมูลได้');
      return
    }
    this.modalServ.open(this.deleteModal(), { size: 'md' });
  }

  confirmDelete() {
    const headId = this.currentResult()?.head?.id
    if (!headId) return

    this.deleting.set(true)
    this.lightServ.deleteContact(headId).subscribe({
      next: () => {
        this.deleting.set(false)
        this.modalServ.dismissAll()
        this.toastService.success('ลบข้อมูลสำเร็จ');
        this.lightList.refetch()
        this.router.navigate(['..'], { relativeTo: this.route })
      },
      error: (err) => {
        this.deleting.set(false)
        this.modalServ.dismissAll()
        const msg = err?.message ?? String(err)
        this.toastService.danger(msg);
      }
    })
  }
}
