import { Component, computed, inject, input, signal } from '@angular/core';
import { CRM_PAGE_CONFIG } from '../../../service/crm-promotion/crm-token';
import { TPromotionBenefit } from '../../../types/crm-promotion.type';
import { FormsModule } from '@angular/forms';
import { PromotionBenefitNamePipe } from '../../../lib/crm-promotion/promotion-benefit-name.pipe';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormAlertTextComponent } from '../form-alert-text.component';

@Component({
  selector: 'app-inline-benefit',
  imports: [FormsModule, PromotionBenefitNamePipe, FormField, FormAlertTextComponent],
  templateUrl: './inline-benefit.component.html',
  styles: ''
})
export class InlineBenefitComponent {
  private readonly config = inject(CRM_PAGE_CONFIG);
  readonly rewardOption = signal(this.config.rewardOption.rewardList)
  form = input.required<FieldTree<TPromotionBenefit>>()

  action = computed(() => this.form().action().value())

}
