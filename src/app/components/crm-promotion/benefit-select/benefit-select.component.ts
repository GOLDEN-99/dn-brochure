import { Component, computed, inject, input, signal } from '@angular/core';
import { TPromotionBenefit, TPromotionProductBase, TPromotionTier } from '../../../types/crm-promotion.type';
import { FormsModule } from '@angular/forms';
import { CRM_PAGE_CONFIG } from '../../../service/crm-promotion/crm-token';
import { PromotionPwpComponent } from "../promotion-pwp/promotion-pwp.component";
import { PromotionGiftComponent } from "../promotion-gift/promotion-gift.component";
import { BenefitTierComponent } from "../benefit-tier/benefit-tier.component";
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormAlertTextComponent } from "../form-alert-text.component";

@Component({
  selector: 'app-benefit-select',
  imports: [FormsModule, PromotionPwpComponent, PromotionGiftComponent, BenefitTierComponent, FormField, FormAlertTextComponent],
  templateUrl: './benefit-select.component.html',
  styles: '',
})
export class BenefitSelectComponent {

  private readonly config = inject(CRM_PAGE_CONFIG);
  readonly rewardOption = signal(this.config.rewardOption.rewardList)
  readonly thresholdList = signal(this.config.rewardOption.thresholdList)
  form = input.required<FieldTree<TPromotionBenefit>>()


  showRewardPool = computed(() => {
    const action = this.form().action().value()
    return action === 'PWP' || action === 'GIFT'
  })

  addTier() {
    this.form().tiers().controlValue.update(
      prev => [...prev, { thresholdValue: 0, rewardValue: 0 }]
    )
  }
  onDeleteTier(index: number) {
    this.form().tiers().controlValue.update(prev => prev.filter((_, i) => i !== index))
  }

  onAddProduct(product: TPromotionProductBase[]) {
    const action = this.form().action().value()
    this.form().rewardPool().controlValue.update(prev => [...prev, ...product.flatMap(p => {
      if (action === "PWP") return [{ ...p, itemBenefitType: 'PRICE', itemBenefitValue: 0 }]
      if (action === "GIFT") return [{ ...p, itemBenefitType: 'BATHDISC', itemBenefitValue: 0 }]
      return []
    })])
  }
  onIsRepeatChange(isRepeat: boolean) {
    if (isRepeat) {
      this.form().tiers().controlValue.update(prev => [prev[0]])
    }
    this.form().isRepeat().controlValue.set(isRepeat)
  }

  onActionChange(action: string) {
    this.form().rewardPool().controlValue.set([])
    this.form().thresholdType().controlValue.set(this.config.initialData.promotionBenefit.thresholdType)
    this.form().rewardPool().controlValue.set(this.config.initialData.promotionBenefit.rewardPool)
    this.form().tiers().controlValue.set(this.config.initialData.promotionBenefit.tiers)
    this.form().action().controlValue.set(action)
  }


  onChangeTierAt(index: number, tier: TPromotionTier) {
    this.form().tiers().controlValue.update(prev => prev.map((p, i) => i === index ? tier : p))
  }
}
