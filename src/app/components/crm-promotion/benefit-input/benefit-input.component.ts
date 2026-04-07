import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-benefit-input',
  imports: [FormsModule],
  templateUrl: './benefit-input.component.html',
  styleUrl: './benefit-input.component.scss'
})
export class BenefitInputComponent {
  private readonly initValue = {
    thresholdBath: 0, thresholdCount: 0, benefitBath: 0, benefitPercent: 0, benefitPrice: 0, pwpCount: 0
  }
  promotionType = input.required<string>()
  benefitType = input.required<string>()
  showBenefitBath = computed(() => this.benefitType() === "BATH")
  showBenefitPercent = computed(() => this.benefitType() === "PERCENT")
  showBenefitPrice = computed(() => this.benefitType() === "PRICE")


  isPWP = computed(() => this.promotionType() === "PWP")
  thresholdType = input.required<string>()
  showThresholdBath = computed(() => this.thresholdType() === "BATH")

  addBenefit = output<TPromotionBenefit>()
  formState = signal<TPromotionBenefit>(this.initValue)

  onSubmit() {
    this.addBenefit.emit(this.formState());
    this.formState.set(this.initValue)
  }

  onChangeState<K extends keyof TPromotionBenefit>(field: K, value: TPromotionBenefit[K]) {
    this.formState.update(prev => ({ ...prev, [field]: value }))
  }
}

type TPromotionBenefit = {
  thresholdBath: number,
  thresholdCount: number,
  benefitBath: number,
  benefitPercent: number,
  benefitPrice: number,
  pwpCount: number,
}