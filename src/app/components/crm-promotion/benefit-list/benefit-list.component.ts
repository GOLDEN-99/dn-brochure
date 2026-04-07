import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-benefit-list',
  imports: [],
  templateUrl: './benefit-list.component.html',
  styleUrl: './benefit-list.component.scss'
})
export class BenefitListComponent {
  benefitList = input<TPromotionBenefit[]>([])
  promotionType = input.required<string>()
  benefitType = input.required<string>()
  deleteByIndex = output<number>()
  showBenefitBath = computed(() => this.benefitType() === "BATH")
  showBenefitPercent = computed(() => this.benefitType() === "PERCENT")
  showBenefitPrice = computed(() => this.benefitType() === "PRICE")


  isPWP = computed(() => this.promotionType() === "PWP")
  thresholdType = input.required<string>()
  showThresholdBath = computed(() => this.thresholdType() === "BATH")

  onDelete(idx: number) {
    this.deleteByIndex.emit(idx)
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