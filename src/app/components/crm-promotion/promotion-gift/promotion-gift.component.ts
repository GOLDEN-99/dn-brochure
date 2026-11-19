import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { ProductPickerComponent } from "../product-picker/product-picker.component";
import { ProductNamePipe } from '../../../lib/crm-promotion/product-name.pipe';
import { TPromotionBenefit, TPromotionProductBase } from '../../../types/crm-promotion.type';
import { FieldTree } from '@angular/forms/signals';
import { productKey, sameProduct } from '../../../lib/crm-promotion/product-key';

@Component({
  selector: 'app-promotion-gift',
  imports: [ProductPickerComponent, ProductNamePipe],
  templateUrl: './promotion-gift.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: '',
})
export class PromotionGiftComponent {
  rewardForm = input.required<FieldTree<TPromotionBenefit>>()
  rewardPool = computed(() => this.rewardForm().rewardPool().value())
  readonly productKey = productKey

  onAddProduct(products: TPromotionProductBase[]) {
    this.rewardForm().rewardPool().controlValue.update(prev => [...prev, ...products.map(product => ({ ...product, itemBenefitType: 'PRICE', itemBenefitValue: 0 }))])
  }

  // by the pair (good, unit): a gift of the strip and a gift of the box are two pool rows
  onRemoveProduct(product: TPromotionProductBase) {
    this.rewardForm().rewardPool().controlValue.update(prev => prev.filter(p => !sameProduct(p, product)))
  }
}
