import { Component, computed, inject, model, signal } from '@angular/core';
import { TProductRewardPool, TPromotionProductBase, TPromotionTier } from '../../../types/crm-promotion.type';
import { FormsModule } from '@angular/forms';
import { CRM_PAGE_CONFIG } from '../../../service/crm-promotion/crm-token';
import { PromotionPwpComponent } from "../promotion-pwp/promotion-pwp.component";
import { PromotionGiftComponent } from "../promotion-gift/promotion-gift.component";
import { BenefitTierComponent } from "../benefit-tier/benefit-tier.component";

@Component({
  selector: 'app-benefit-select',
  imports: [FormsModule, PromotionPwpComponent, PromotionGiftComponent, BenefitTierComponent],
  templateUrl: './benefit-select.component.html',
  styles: '',
})
export class BenefitSelectComponent {

  private readonly config = inject(CRM_PAGE_CONFIG);
  readonly rewardOption = signal(this.config.rewardOption.rewardList)
  readonly thresholdList = signal(this.config.rewardOption.thresholdList)
  action = model.required<string>()
  isRepeat = model.required<boolean>()
  thresholdType = model.required<string>()
  rewardPool = model.required<TProductRewardPool[]>()
  tiers = model.required<TPromotionTier[]>()

  showRewardPool = computed(() => {
    const action = this.action()
    return action === 'PWP' || action === 'GIFT'
  })

  addTier() {
    this.tiers.update(prev => {
      const lst = prev.at(-1)
      return [...prev, lst ?? { thresholdValue: 0, rewardValue: 0 }]
    })
  }
  onDeleteTier(index: number) {
    this.tiers.update(prev => prev.filter((_, i) => i !== index))
  }

  onAddProduct(product: TPromotionProductBase[]) {
    const action = this.action()
    this.rewardPool.update(prev => [...prev, ...product.flatMap(p => {
      if (action === "PWP") return [{ ...p, itemBenefitType: 'PRICE', itemBenefitValue: 0 }]
      if (action === "GIFT") return [{ ...p, itemBenefitType: 'BATHDISC', itemBenefitValue: 0 }]
      return []
    })])
  }
  onIsRepeatChange(isRepeat: boolean) {
    if (isRepeat) {
      this.tiers.update(prev => [prev[0]])
    }
    this.isRepeat.set(isRepeat)
  }

  onActionChange(action: string) {
    this.thresholdType.set(this.config.initialData.thresholdType)
    this.rewardPool.set(this.config.initialData.rewardPool)
    this.tiers.set(this.config.initialData.tiers)
    this.action.set(action)
  }


  onChangeTierAt(index: number, tier: TPromotionTier) {
    this.tiers.update(prev => prev.map((p, i) => i === index ? tier : p))
  }
}
