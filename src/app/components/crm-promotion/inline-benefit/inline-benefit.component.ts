import { Component, computed, inject, model, signal } from '@angular/core';
import { CRM_PAGE_CONFIG } from '../../../service/crm-promotion/crm-token';
import { TPromotionFormState } from '../../../types/crm-promotion.type';
import { FormsModule } from '@angular/forms';
import { PromotionBenefitNamePipe } from '../../../lib/crm-promotion/promotion-benefit-name.pipe';

@Component({
  selector: 'app-inline-benefit',
  imports: [FormsModule, PromotionBenefitNamePipe],
  templateUrl: './inline-benefit.component.html',
  styles: ''
})
export class InlineBenefitComponent {
  private readonly config = inject(CRM_PAGE_CONFIG);
  readonly rewardOption = signal(this.config.rewardOption.rewardList)

  props = model.required<Pick<TPromotionFormState, 'tiers' | 'action'>>()

  action = computed(() => this.props().action)
  tier = computed(() => this.props().tiers[0])

  onActionChange(action: string) {
    this.props.set({ tiers: this.config.initialData.tiers, action })
  }

  onChangeReward(rewardValue: number) {
    this.props.update(({ tiers, action }) => ({ action, tiers: tiers.map(prev => ({ ...prev, rewardValue })) }))
  }
}
