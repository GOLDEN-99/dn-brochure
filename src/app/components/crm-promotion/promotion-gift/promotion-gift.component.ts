import { Component, computed, input, model } from '@angular/core';
import { ProductPickerComponent } from "../product-picker/product-picker.component";
import { ProductNamePipe } from '../../../lib/crm-promotion/product-name.pipe';
import { TPromotionBenefit, TPromotionProductBase } from '../../../types/crm-promotion.type';
import { FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-promotion-gift',
  imports: [ProductPickerComponent, ProductNamePipe],
  templateUrl: './promotion-gift.component.html',
  styles: '',
})
export class PromotionGiftComponent {
  rewardForm = input.required<FieldTree<TPromotionBenefit>>()
  rewardPool = computed(() => this.rewardForm().rewardPool().value())
  onAddProduct(products: TPromotionProductBase[]) {
    this.rewardForm().rewardPool().controlValue.update(prev => [...prev, ...products.map(product => ({ ...product, itemBenefitType: 'PRICE', itemBenefitValue: 0 }))])
  }

  onRemoveProduct(goodCode: string) {
    this.rewardForm().rewardPool().controlValue.update(prev => prev.filter(p => p.goodCode !== goodCode))
  }
}
