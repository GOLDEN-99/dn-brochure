import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDateStruct, NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateInputComponent } from "../../../../components/date-input/date-input.component";
import { BenefitInputComponent } from '../../../../components/crm-promotion/benefit-input/benefit-input.component';
import { BenefitListComponent } from "../../../../components/crm-promotion/benefit-list/benefit-list.component";
import { MemberCheckboxComponent } from "../../../../components/crm-promotion/member-checkbox/member-checkbox.component";
import { DayCheckbooxComponent } from "../../../../components/crm-promotion/day-checkboox/day-checkboox.component";
import { TPromotionBenefit, TPromotionFormState } from '../../../../types/crm-promotion.type';
import { CRM_PAGE_CONFIG } from '../../../../service/crm-promotion/crm-token';

@Component({
  selector: 'app-create-bill-discount-promotion',
  imports: [FormsModule, NgbTimepicker, DateInputComponent, BenefitInputComponent, BenefitListComponent, MemberCheckboxComponent, DayCheckbooxComponent],
  templateUrl: './create-bill-discount-promotion.component.html',
  styleUrl: './create-bill-discount-promotion.component.scss'
})
export class CreateBillDiscountPromotionComponent {
  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()

  private readonly config = inject(CRM_PAGE_CONFIG)

  pageName = signal(this.config.pageName)

  formState = signal<TPromotionFormState>({
    ...this.config.initialData,
    startDate: this.today,
    endDate: this.today,
  })

  handleChangeSource(source: string) {
    if (source === 'HU') {
      this.formState.update((prev) => ({ ...prev, source: 'HU', promotionOrder: 0 }))
    } else {
      this.formState.update((prev) => ({ ...prev, source }))
    }
  }

  handlePromotionTypeChange(promotionType: string) {
    if (promotionType === "1") {
      // bill discount
      this.formState.update(({ benefitType, ...res }) => ({
        ...res,
        promotionBenefit: [],
        pwpPool: [],
        promotionType: "1",
        benefitType: benefitType === "PRICE" ? "BATH" : benefitType
      }))
    }
    if (promotionType === "2") {
      // category
      this.formState.update(({ benefitType, ...res }) => ({
        ...res,
        pwpPool: [],
        promotionType: "2",
        benefitType: benefitType === "PRICE" ? "BATH" : benefitType
      }))
    }
    if (promotionType === "3") {
      // fix_bundle
      this.formState.update(prev => ({
        ...prev,
        pwpPool: [],
        promotionType: "3",
        thresholdType: "COUNT", benefitType: "PRICE"
      }))
    }
    if (promotionType === "4") {
      // pick_bundle
      this.formState.update(prev => ({
        ...prev,
        pwpPool: [],
        promotionType: "4",
        thresholdType: "COUNT",
        benefitType: "PRICE"
      }))
    }
    if (promotionType === "5") {
      // pwp
      this.formState.update(prev => ({ ...prev, pwpPool: [], promotionBenefit: [], promotionType: "5" }))
    }
    if (promotionType === "6") {
      //inline bath discount
      this.formState.update(prev => ({ ...prev, pwpPool: [], promotionBenefit: [], promotionType: "6" }))
    }
  }

  showProductPicker = computed(() => this.formState().promotionType !== "1")

  canChangeBenefit = computed(() => ["1", "2"].includes(this.formState().promotionType))

  showPWP = computed(() => this.formState().promotionType === "5")

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

  onAddBenefit(benefit: TPromotionBenefit) {
    this.formState.update(({ promotionBenefit, ...res }) => ({
      ...res,
      promotionBenefit: [...promotionBenefit, benefit].sort(this.sorter(res.promotionType))
    }))
  }

  sorter(thresholdType: string): TSorter<TPromotionBenefit> {
    if (thresholdType === 'BATH') return (a, b) => a.thresholdBath - b.thresholdBath
    if (thresholdType === 'COUNT') return (a, b) => a.thresholdCount - b.thresholdCount
    return undefined
  }

  onDeleteBenefit(idx: number) {
    this.formState.update(({ promotionBenefit, ...res }) => ({ ...res, promotionBenefit: promotionBenefit.filter((_, i) => i !== idx) }))
  }

  onFormStateChange<K extends keyof TPromotionFormState>(key: K, value: TPromotionFormState[K]) {
    this.formState.update(prev => ({ ...prev, [key]: value }))
  }
}


type TSorter<T> = ((a: T, b: T) => number) | undefined

