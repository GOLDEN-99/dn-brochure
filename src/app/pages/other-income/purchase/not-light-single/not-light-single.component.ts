import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { OiNotLightService } from '../../../../service/other-income/oi-not-light.service';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeHeadEditComponent } from "../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component";
import { OtherIncomeNotLightEditComponent } from "../../../../components/other-income/edit/other-income-not-light-edit/other-income-not-light-edit.component";
import { OtherIncomeProductEditComponent } from "../../../../components/other-income/edit/other-income-product-edit/other-income-product-edit.component";
import { FormsModule } from '@angular/forms';
import { OtherIncomeMonthlyEditComponent } from "../../../../components/other-income/edit/other-income-monthly-edit/other-income-monthly-edit.component";
import { CreatePeriodComponent } from "../../../../components/other-income/create/create-period/create-period.component";
import { ToastService } from '../../../../service/toast/toast.service';
import { OtherIncomeMonthlyIncentiveEditComponent } from "../../../../components/other-income/edit/other-income-monthly-incentive-edit/other-income-monthly-incentive-edit.component";
import { OtherIncomeMonthlyListComponent } from "../../../../components/other-income/template/other-income-monthly-list.component";
import { OTHER_INCOME_PAGE_TOKEN } from '../../../../lib';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PeriodNotLightService } from '../../../../service/other-income/period-not-light.service';
import { OiNotLightListService } from '../../../../service/other-income/oi-not-light-list.service';
import { PeriodDisplayComponent } from "../../../../other-income/shared/components/period-display/period-display.component";

@Component({
  selector: 'app-not-light-single',
  imports: [
    OtherIncomeHeadEditComponent, OtherIncomeNotLightEditComponent,
    OtherIncomeMonthlyEditComponent, OtherIncomeProductEditComponent,
    OtherIncomeMonthlyEditComponent, CreatePeriodComponent,
    NgbDatepickerModule, FormsModule,
    OtherIncomeMonthlyIncentiveEditComponent,
    OtherIncomeMonthlyListComponent,
    RouterLink,
    PeriodDisplayComponent
  ],
  templateUrl: './not-light-single.component.html',
  styleUrl: './not-light-single.component.scss'
})
export class NotLightSingleComponent {

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly toastService = inject(ToastService)
  private readonly modalServ = inject(NgbModal)
  private readonly _pageToken = inject(OTHER_INCOME_PAGE_TOKEN)
  isPurchase = this._pageToken.isPurchase
  private readonly notLightServ = inject(OiNotLightService)
  private readonly oiListService = inject(OiNotLightListService)

  private readonly deleteModal = viewChild('deleteModal')
  deleting = signal(false)
  data = this.notLightServ.singleRecord
  private readonly notLightPeriod = inject(PeriodNotLightService)
  invalidValue = computed(() => this.data().length !== 1)
  currentResult = computed(() => this.data()[0])

  incomeList = computed(() => this.currentResult().incomeList)

  criteria = computed(() => {
    const { notLight } = this.currentResult()
    if (!notLight) return null
    const { isComp, isDc, isInce, incVat, isRebate } = notLight
    return { isDc, isRebate, isComp, isInce, incVat }
  })

  periodList = computed(() => this.currentResult().periodList)

  onSuccess(value: string) {
    this.toastService.success(value);
    this.oiListService.refetch();
    this.notLightServ.refetch();
    this.notLightPeriod.refetch();
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
    this.notLightServ.deleteContact(headId).subscribe({
      next: () => {
        this.deleting.set(false)
        this.modalServ.dismissAll()
        this.toastService.success('ลบข้อมูลสำเร็จ');
        this.notLightPeriod.refetch();
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