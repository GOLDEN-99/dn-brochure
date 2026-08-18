import { Component, computed, inject, input, signal } from '@angular/core';
import { TPromotionBenefit, TPromotionTier } from '../../../types/crm-promotion.type';
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

  // Called from the template on top of [formField], which owns the isRepeat value.
  onIsRepeatChange(isRepeat: boolean) {
    if (!isRepeat) return
    // a repeating benefit carries exactly one tier
    this.form().tiers().controlValue.update(prev => prev.slice(0, 1))
  }

  // Called from the template on top of [formField], which owns the action value.
  onActionChange() {
    const initial = this.config.initialData.promotionBenefit
    // The reward pool is typed per reward action, so it can never carry over:
    // a PWP item kept across a switch becomes a mistyped gift, and a pool left
    // on a discount action is persisted as orphan data.
    this.form().rewardPool().controlValue.set([])
    this.form().thresholdType().controlValue.set(initial.thresholdType)
    // copy: the page config is a shared singleton, never hand out its array
    this.form().tiers().controlValue.set(initial.tiers.map(tier => ({ ...tier })))
  }


  onChangeTierAt(index: number, tier: TPromotionTier) {
    this.form().tiers().controlValue.update(prev => prev.map((p, i) => i === index ? tier : p))
  }
}
