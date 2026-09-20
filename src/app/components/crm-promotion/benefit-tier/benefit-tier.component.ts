import { Component, computed, input, output } from '@angular/core';
import { TPromotionTier } from '../../../types/crm-promotion.type';
import { FormsModule } from '@angular/forms';
import { PromotionBenefitNamePipe } from '../../../lib/crm-promotion/promotion-benefit-name.pipe';
import { PromotionThresholdPipe } from '../../../lib/crm-promotion/promotion-threshold.pipe';
import { FieldTree, FormField } from "@angular/forms/signals";
import { FormAlertTextComponent } from "../form-alert-text.component";
import { isPoolOnlyAction } from '../../../lib/crm-promotion/promotion-actions';

let benefitId = 0

@Component({
  selector: 'app-benefit-tier',
  imports: [FormsModule, PromotionBenefitNamePipe, PromotionThresholdPipe, FormField, FormAlertTextComponent],
  templateUrl: './benefit-tier.component.html',
  styles: '',
})
export class BenefitTierComponent {
  id!: number
  constructor() {
    this.id = benefitId++
  }
  form = input.required<FieldTree<TPromotionTier>>()
  readonly thresholdType = input.required<string>()
  readonly action = input.required<string>()
  readonly canDelete = input(false)
  // Fixed-action pages hide the number they pin: ค่าสมาชิก has no reward value (the
  // benefit is the free SKU, not an amount) and แถมในกลุ่ม has no threshold (always
  // one set). Hidden here rather than in the schema -- the value still has to be
  // present and valid in the payload.
  readonly showThreshold = input(true)
  readonly showReward = input(true)

  deleteTier = output()
  onDeleteTier() {
    this.deleteTier.emit();
  }

  isPwp = computed(() => this.action() === 'PWP')

  isGift = computed(() => this.action() === 'GIFT')

  // PWP/GIFT carry the whole benefit in rewardPool, so the tier's reward number
  // means nothing. It used to render anyway, and `required` forced the author to
  // put a made-up value in it that then shipped in the payload.
  isPoolOnly = computed(() => isPoolOnlyAction(this.action()))

}
