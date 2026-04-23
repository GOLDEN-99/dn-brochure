import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDateStruct, NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateInputComponent } from "../../../../components/date-input/date-input.component";
import { DayCheckbooxComponent } from "../../../../components/crm-promotion/day-checkboox/day-checkboox.component";
import { TCreatePromotionRequest, TMember, TPromotionFilterState, TPromotionFormState, TPromotionProductBase } from '../../../../types/crm-promotion.type';
import { CRM_PAGE_CONFIG } from '../../../../service/crm-promotion/crm-token';
import { InlineBranchLimitComponent } from "../../../../components/crm-promotion/inline-branch-limit/inline-branch-limit.component";
import { InlineMemberComponent } from "../../../../components/crm-promotion/inline-member/inline-member.component";
import { PromotionFilterComponent } from "../../../../components/crm-promotion/promotion-filter/promotion-filter.component";
import { BenefitSelectComponent } from "../../../../components/crm-promotion/benefit-select/benefit-select.component";
import { InlineBenefitComponent } from '../../../../components/crm-promotion/inline-benefit/inline-benefit.component';
import { CrmPromotionService } from '../../../../service/crm-promotion/crm-promotion.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-create-bill-discount-promotion',
  imports: [
    FormsModule, NgbTimepicker,
    DateInputComponent, DayCheckbooxComponent,
    InlineBranchLimitComponent, InlineMemberComponent,
    PromotionFilterComponent,
    BenefitSelectComponent, InlineBenefitComponent,
    JsonPipe
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

  formState = signal<TPromotionFormState>({
    ...this.config.initialData,
    startDate: this.today,
    endDate: this.today,
  })

  onRewardPoolChange(product: TPromotionProductBase) {
    this.formState.update(({ rewardPool, ...res }) => ({ ...res, rewardPool: [...rewardPool, { ...product, itemBenefitType: "BATHDISC", itemBenefitValue: 0 }] }))
  }

  handleChangeSource(source: string) {
    if (source === 'HU') {
      this.formState.update((prev) => ({ ...prev, source: 'HU', promotionOrder: 0 }))
    } else {
      this.formState.update((prev) => ({ ...prev, source }))
    }
  }


  toggleTime(eve: boolean) {
    if (eve) {
      this.formState.update(prev => ({ ...prev, limitTime: true }))
    } else {
      this.formState.update(prev => ({ ...prev, limitTime: false, startTime: { hour: 10, minute: 0, second: 0 }, endTime: { hour: 22, minute: 0, second: 0 } }))
    }

  }

  toggleBranch(eve: boolean) {
    if (eve) {
      this.formState.update(prev => ({ ...prev, isBranchSpecific: true }))
    } else {
      this.formState.update(prev => ({ ...prev, isBranchSpecific: false, branches: [] }))
    }
  }

  onFormStateChange<K extends keyof TPromotionFormState>(key: K, value: TPromotionFormState[K]) {
    this.formState.update(prev => ({ ...prev, [key]: value }))
  }

  onUpdateFormState(current: Partial<TPromotionFormState>) {
    this.formState.update(prev => ({ ...prev, ...current }))
  }

  onAddSkuProductExist() {
    this.formState.update(({ filterList, ...res }) => ({
      ...res, filterList: [...filterList, {
        productList: [],
        filterType: 'EXIST',
        filterValue: 0
      }]
    }))
  }

  onAddSkuProductSubtotal() {
    this.formState.update(({ filterList, ...res }) => ({
      ...res, filterList: [...filterList, {
        productList: [],
        filterType: 'SUBTOTAL',
        filterValue: 0
      }]
    }))
  }

  onAddSkuProductCount() {
    this.formState.update(({ filterList, ...res }) => ({
      ...res, filterList: [...filterList, {
        productList: [],
        filterType: 'COUNT',
        filterValue: 0
      }]
    }))
  }

  onChangeFilter(filterCondition: TPromotionFilterState, index: number) {
    console.log('update filter condition')
    this.formState.update((({ filterList, ...res }) => ({
      ...res,
      filterList: filterList.map((f, i) =>
        i === index
          ? filterCondition
          : f
      )
    })))
  }

  onDeleteFilter(index: number) {
    this.formState.update((({ filterList, ...res }) => ({
      ...res,
      filterList: filterList.filter((_, i) => i !== index)
    })))
  }

  onChangeMember(members: TMember[]) {
    this.formState.update((prev) => ({ ...prev, members }))
  }

  onRemoveMember(memberId: number) {
    this.formState.update(({ members, ...res }) => ({ ...res, members: members.filter(m => m.id !== memberId) }))
  }

  onLimitTierChange(limitTier: boolean) {
    this.formState.update(({ isMemberSpecific, ...res }) => ({ ...res, isMemberSpecific: limitTier }))
  }

  onRemoveBranch(branchCode: string) {
    this.formState.update(({ branches, ...res }) => ({ ...res, branches: branches.filter(b => b.branchCode !== branchCode) }))
  }

  private ngbDateToIso({ day, month, year }: NgbDateStruct) {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  private ngbTimeToTime({ hour, minute, second }: NgbTimeStruct) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
  }

  private ngbTimeLesser(start: NgbTimeStruct, end: NgbTimeStruct) {
    // true if start < end
    if (start.hour !== end.hour) return start.hour < end.hour
    if (start.minute !== end.minute) return start.minute < end.minute
    return start.second < end.second
  }

  private validReward({ promotionType, action, rewardPool }: Pick<TPromotionFormState, 'promotionType' | 'action' | 'rewardPool'>) {
    // ITEM promotions store benefit per-product via InlineBenefitComponent, not in rewardPool
    if (promotionType === 'ITEM') return true
    // Tier-based discount actions need no product reward pool — reward is defined by the tiers
    if (action === 'BILLBATHDISC' || action === 'BILLPERCENTDISC' || action === 'BUNDLEBATHDISC' || action === 'BUNDLEPERCENTDISC' || action === 'BUNDLEPRICE') return true
    if (rewardPool.length === 0) return false
    if (action === 'PWP') {
      return rewardPool.every(r => r.itemBenefitValue > 0)
    }
    if (action === 'GIFT') {
      return rewardPool.every(r => r.itemBenefitValue === 0)
    }
    if (action.includes('PERCENT')) {
      return rewardPool.every(r => r.itemBenefitValue > 0 && r.itemBenefitValue <= 100)
    }
    return rewardPool.every(r => r.itemBenefitValue > 0)
  }

  private validTier({ promotionType, thresholdType, tiers, isRepeat }: Pick<TPromotionFormState, 'thresholdType' | 'tiers' | 'promotionType' | 'isRepeat'>) {
    if (tiers.length === 0) return false
    if (isRepeat && tiers.length !== 1) return false
    if (!thresholdType.startsWith(promotionType)) return false
    if (promotionType === 'BILL') return tiers.every(tier => tier.rewardValue > 0 && tier.thresholdValue > 0)
    return tiers.every(tier => tier.rewardValue > 0)
  }

  submitting = signal(false)
  canSubmit = computed(() => this.validForm() && !this.submitting())

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

  validForm = computed(() => {
    const {
      promotionName, promotionType,
      isBranchSpecific, branches,
      isMemberSpecific, members,
      limitTime, startTime, endTime,
      filterList, action, thresholdType, rewardPool, isRepeat, tiers
    } = this.formState()
    return promotionName.trim() !== ""
      && (!isBranchSpecific || branches.length !== 0)
      && (!isMemberSpecific || members.length !== 0)
      && (!isRepeat || tiers.length === 1)
      && filterList.reduce((acc, cur) => acc && (cur.filterType === 'EXIST' ? cur.productList.length > 0 : cur.filterValue > 0), true)
      && this.validTier({ promotionType, thresholdType, tiers, isRepeat })
      && (!limitTime || this.ngbTimeLesser(startTime, endTime))
      && this.validReward({ promotionType, action, rewardPool })
  })

  get createRequest(): TCreatePromotionRequest {
    const {
      promotionName, promotionDesc, promotionType,
      promotionOrder, promotionPriority, startDate, endDate,
      isBranchSpecific, branches,
      isMemberSpecific, members,
      limitTime, startTime, endTime, activeDay,
      filterList,
      action, thresholdType, rewardPool, isRepeat, tiers
    } = this.formState()
    return {
      promotionName: promotionName.trim(),
      promotionDesc: promotionDesc.trim(),
      promotionType, promotionOrder, promotionPriority,
      startDate: this.ngbDateToIso(startDate),
      endDate: this.ngbDateToIso(endDate),
      isBranchSpecific, branches: branches.map(({ branchCode }) => branchCode),
      isMemberSpecific, members: members.map(({ id }) => id),
      limitTime, startTime: this.ngbTimeToTime(startTime), endTime: this.ngbTimeToTime(endTime),
      activeDay: activeDay.reduce((acc, cur) => acc + (cur ? '1' : '0'), ''),
      filterList: filterList.map(({ productList, ...res }) => ({ productList: productList.map(p => p.goodCode), ...res })),
      action, thresholdType, isRepeat,
      rewardPool: rewardPool.map(({ goodName, sku, ...res }) => ({ ...res })),
      tiers
    }
  }
}

