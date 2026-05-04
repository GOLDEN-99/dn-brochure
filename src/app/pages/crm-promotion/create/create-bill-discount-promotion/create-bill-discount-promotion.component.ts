import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { TCreatePromotionRequest, TMember, TPromotionBenefit, TPromotionFilterState, TPromotionProductBase } from '../../../../types/crm-promotion.type';
import { CRM_PAGE_CONFIG } from '../../../../service/crm-promotion/crm-token';
import { PromotionFilterComponent } from "../../../../components/crm-promotion/promotion-filter/promotion-filter.component";
import { BenefitSelectComponent } from "../../../../components/crm-promotion/benefit-select/benefit-select.component";
import { InlineBenefitComponent } from '../../../../components/crm-promotion/inline-benefit/inline-benefit.component';
import { CrmPromotionService } from '../../../../service/crm-promotion/crm-promotion.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { form, FormField } from '@angular/forms/signals';
import {
  createPromotionSchema,
  TCreatePromotionForm
} from './createPromotionSchema';
import { PromotionMasterComponent } from "../../../../components/crm-promotion/create-promotion-subform/promotion-master/promotion-master.component";
import { JsonPipe } from '@angular/common';
import { PromotionDatetimeComponent } from "../../../../components/crm-promotion/create-promotion-subform/promotion-datetime/promotion-datetime.component";
import { PromotionLimitUsageComponent } from "../../../../components/crm-promotion/create-promotion-subform/promotion-limit-usage/promotion-limit-usage.component";

@Component({
  selector: 'app-create-bill-discount-promotion',
  imports: [
    FormsModule,
    PromotionFilterComponent,
    BenefitSelectComponent, InlineBenefitComponent,
    PromotionMasterComponent, JsonPipe,
    PromotionDatetimeComponent,
    PromotionLimitUsageComponent
],
  templateUrl: './create-bill-discount-promotion.component.html',
  styles: ''
})
export class CreateBillDiscountPromotionComponent {
  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()
  private readonly config = inject(CRM_PAGE_CONFIG)
  private readonly promotionService = inject(CrmPromotionService)
  private readonly toastService = inject(ToastService)
  private readonly router = inject(Router)

  showFilterOption = signal(this.config.filterOption.showFilter)
  showItem = signal(this.config.filterOption.showItem)
  showFilterList = signal(this.config.filterOption.showList)
  showBundle = signal(this.config.filterOption.showBundle)

  pageName = signal(this.config.pageName)

  formModel = signal<TCreatePromotionForm>({
    ...this.config.initialData,
    promotionMaster: {
      ...this.config.initialData.promotionMaster,
      startDate: this.today,
      endDate: this.today,
    },
  })

  promotionForm = form(this.formModel, createPromotionSchema)

  // ── Master ────────────────────────────────────────────────

  onMasterChange<K extends keyof TCreatePromotionForm['promotionMaster']>(
    key: K, value: TCreatePromotionForm['promotionMaster'][K]
  ) {
    this.formModel.update(s => ({ ...s, promotionMaster: { ...s.promotionMaster, [key]: value } }))
  }

  handleChangeSource(source: string) {
    this.formModel.update(s => ({
      ...s,
      promotionMaster: {
        ...s.promotionMaster,
        source,
        ...(source === 'HU' ? { promotionOrder: '0' } : {})
      }
    }))
  }

  // ── Datetime ─────────────────────────────────────────────

  toggleTime(eve: boolean) {
    if (eve) {
      this.formModel.update(s => ({ ...s, promotionDatetime: { ...s.promotionDatetime, limitTime: true } }))
    } else {
      this.formModel.update(s => ({
        ...s,
        promotionDatetime: {
          ...s.promotionDatetime,
          limitTime: false,
          startTime: { hour: 10, minute: 0, second: 0 },
          endTime: { hour: 22, minute: 0, second: 0 }
        }
      }))
    }
  }

  onDatetimeChange<K extends keyof TCreatePromotionForm['promotionDatetime']>(
    key: K, value: TCreatePromotionForm['promotionDatetime'][K]
  ) {
    this.formModel.update(s => ({ ...s, promotionDatetime: { ...s.promotionDatetime, [key]: value } }))
  }

  // ── Member ────────────────────────────────────────────────

  onLimitTierChange(isMemberSpecific: boolean) {
    this.formModel.update(s => ({ ...s, promotionMember: { ...s.promotionMember, isMemberSpecific } }))
  }

  onChangeMember(members: TMember[]) {
    this.formModel.update(s => ({ ...s, promotionMember: { ...s.promotionMember, members } }))
  }

  onRemoveMember(memberId: number) {
    this.formModel.update(s => ({
      ...s,
      promotionMember: { ...s.promotionMember, members: s.promotionMember.members.filter(m => m.id !== memberId) }
    }))
  }

  // ── Branch ────────────────────────────────────────────────

  toggleBranch(isBranchSpecific: boolean) {
    this.formModel.update(s => ({
      ...s,
      promotionBranch: {
        ...s.promotionBranch,
        isBranchSpecific,
        ...(isBranchSpecific ? {} : { branches: [] })
      }
    }))
  }

  onRemoveBranch(branchCode: string) {
    this.formModel.update(s => ({
      ...s,
      promotionBranch: { ...s.promotionBranch, branches: s.promotionBranch.branches.filter(b => b.branchCode !== branchCode) }
    }))
  }

  onBranchChange<K extends keyof TCreatePromotionForm['promotionBranch']>(
    key: K, value: TCreatePromotionForm['promotionBranch'][K]
  ) {
    this.formModel.update(s => ({ ...s, promotionBranch: { ...s.promotionBranch, [key]: value } }))
  }

  // ── Filter ────────────────────────────────────────────────

  onAddSkuProductExist() {
    this.formModel.update(s => ({
      ...s, promotionFilter: [...s.promotionFilter, { productList: [], filterType: 'EXIST', filterValue: 0 }]
    }))
  }

  onAddSkuProductSubtotal() {
    this.formModel.update(s => ({
      ...s, promotionFilter: [...s.promotionFilter, { productList: [], filterType: 'SUBTOTAL', filterValue: 0 }]
    }))
  }

  onAddSkuProductCount() {
    this.formModel.update(s => ({
      ...s, promotionFilter: [...s.promotionFilter, { productList: [], filterType: 'COUNT', filterValue: 0 }]
    }))
  }

  onChangeFilter(filterCondition: TPromotionFilterState, index: number) {
    this.formModel.update(s => ({
      ...s,
      promotionFilter: s.promotionFilter.map((f, i) => i === index ? filterCondition : f)
    }))
  }

  onDeleteFilter(index: number) {
    this.formModel.update(s => ({ ...s, promotionFilter: s.promotionFilter.filter((_, i) => i !== index) }))
  }

  // ── Benefit ───────────────────────────────────────────────

  onBenefitChange(partial: Partial<TPromotionBenefit>) {
    this.formModel.update(s => ({ ...s, promotionBenefit: { ...s.promotionBenefit, ...partial } }))
  }

  onRewardPoolChange(product: TPromotionProductBase) {
    this.formModel.update(s => ({
      ...s,
      promotionBenefit: {
        ...s.promotionBenefit,
        rewardPool: [...s.promotionBenefit.rewardPool, { ...product, itemBenefitType: 'BATHDISC', itemBenefitValue: 0 }]
      }
    }))
  }

  // ── Submission ────────────────────────────────────────────

  submitting = signal(false)

  canSubmit = computed(() => {
    const { invalid } = this.promotionForm()
    return !invalid() && !this.submitting()
  })

  onSubmit() {
    this.submitting.set(true)
    this.promotionService.createPromotion(this.createRequest).subscribe({
      next: () => {
        this.toastService.success('สร้างโปรโมชั่นสำเร็จ')
        this.promotionService.refetchPromotions()
        this.router.navigate(['/crm-promotion'])
      },
      error: () => {
        this.toastService.danger('เกิดข้อผิดพลาดในการสร้างโปรโมชั่น')
        this.submitting.set(false)
      },
    })
  }

  private ngbDateToIso({ day, month, year }: { day: number; month: number; year: number }) {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  private ngbTimeToTime({ hour, minute, second }: { hour: number; minute: number; second: number }) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
  }

  get createRequest(): TCreatePromotionRequest {
    const { promotionMaster, promotionDatetime, promotionMember, promotionBranch, promotionFilter, promotionBenefit } = this.formModel()
    const { promotionName, promotionDesc, promotionType, promotionOrder, promotionPriority, startDate, endDate } = promotionMaster
    const { activeDay, limitTime, timeSpan : {startTime, endTime } } = promotionDatetime
    const { isMemberSpecific, members } = promotionMember
    const { isBranchSpecific, branches } = promotionBranch
    const { action, thresholdType, isRepeat, tiers, rewardPool } = promotionBenefit
    return {
      promotionName: promotionName.trim(),
      promotionDesc: promotionDesc.trim(),
      promotionType, promotionOrder: Number(promotionOrder), promotionPriority: Number(promotionPriority),
      startDate: this.ngbDateToIso(startDate),
      endDate: this.ngbDateToIso(endDate),
      isBranchSpecific, branches: branches.map(({ branchCode }) => branchCode),
      isMemberSpecific, members: members.map(({ id }) => id),
      limitTime,
      startTime: this.ngbTimeToTime(startTime),
      endTime: this.ngbTimeToTime(endTime),
      activeDay: activeDay.reduce((acc, cur) => acc + (cur ? '1' : '0'), ''),
      filterList: promotionFilter.map(({ productList, ...res }) => ({ productList: productList.map(p => p.goodCode), ...res })),
      action, thresholdType, isRepeat,
      rewardPool: rewardPool.map(({ goodName, sku, ...res }) => ({ ...res })),
      tiers
    }
  }
}
