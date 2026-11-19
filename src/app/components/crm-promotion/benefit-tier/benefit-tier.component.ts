import { Component, computed, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TPromotionTier } from '../../../types/crm-promotion.type';
import { FormsModule } from '@angular/forms';
import { PromotionBenefitNamePipe } from '../../../lib/crm-promotion/promotion-benefit-name.pipe';
import { PromotionThresholdPipe } from '../../../lib/crm-promotion/promotion-threshold.pipe';
import { FieldTree, FormField } from "@angular/forms/signals";
import { FormAlertTextComponent } from "../form-alert-text.component";
import { CHEAPEST_ACTION, isPoolOnlyAction } from '../../../lib/crm-promotion/promotion-actions';

let benefitId = 0

@Component({
  selector: 'app-benefit-tier',
  imports: [FormsModule, PromotionBenefitNamePipe, PromotionThresholdPipe, FormField, FormAlertTextComponent],
  templateUrl: './benefit-tier.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  // The option label from the page's own list, so the input reads as the option the user picked.
  // Null falls back to the shared benefit-name pipe.
  readonly rewardLabel = input<string | null>(null)

  deleteTier = output()
  onDeleteTier() {
    this.deleteTier.emit();
  }

  isPwp = computed(() => this.action() === 'PWP')

  isGift = computed(() => this.action() === 'GIFT')

  // PWP/GIFT carry the BENEFIT in rewardPool -- which SKU, at what price. The tier's number is a
  // different question: how many pieces are given, how many claims are offered. Hiding it (an earlier
  // attempt to stop `required` forcing a made-up amount) left it at 0 in the payload, and
  // CrmPromotionEngine reads it as that quantity -- dropping the promotion at `reward <= 0` before any
  // gift or entitlement is emitted. So it renders, with a count label of its own.
  isPoolOnly = computed(() => isPoolOnlyAction(this.action()))

  poolCountLabel = computed(() =>
    this.action() === 'GIFT' ? 'จำนวนของแถม (ชิ้น)' : 'จำนวนสิทธิ์แลกซื้อ (ชิ้น)')

  // CHEAPEST is a count too (free units per set). It used to borrow the option label, which now
  // reads "ซื้อ N แถม M (...)" -- a fine name for the option, not for a number box.
  isCheapest = computed(() => this.action() === CHEAPEST_ACTION)
  readonly cheapestCountLabel = 'จำนวนชิ้นที่แถม (ชิ้นถูกสุดในชุด)'

}
