import { Component, computed, input, model, output } from '@angular/core';
import { TPromotionTier } from '../../../types/crm-promotion.type';
import { FormsModule } from '@angular/forms';
import { PromotionBenefitNamePipe } from '../../../lib/crm-promotion/promotion-benefit-name.pipe';
import { PromotionThresholdPipe } from '../../../lib/crm-promotion/promotion-threshold.pipe';

let benefitId = 0

@Component({
  selector: 'app-benefit-tier',
  imports: [FormsModule, PromotionBenefitNamePipe, PromotionThresholdPipe],
  templateUrl: './benefit-tier.component.html',
  styles: '',
})
export class BenefitTierComponent {
  id!: number
  constructor() {
    this.id = benefitId++
  }
  tier = model.required<TPromotionTier>()
  readonly thresholdType = input.required<string>()
  readonly action = input.required<string>()
  readonly canDelete = input(false)
  deleteTier = output()
  onDeleteTier() {
    this.deleteTier.emit();
  }

  isPwp = computed(() => this.action() === 'PWP')

  isGift = computed(() => this.action() === 'GIFT')

  onChangeReward(rewardValue: number) {
    this.tier.update(prev => ({ ...prev, rewardValue }))
  }

  onChangeThreshold(thresholdValue: number) {
    this.tier.update(prev => ({ ...prev, thresholdValue }))
  }
}
