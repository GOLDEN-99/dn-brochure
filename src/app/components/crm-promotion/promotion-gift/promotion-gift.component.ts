import { Component, model } from '@angular/core';
import { ProductPickerComponent } from "../product-picker/product-picker.component";
import { ProductNamePipe } from '../../../lib/crm-promotion/product-name.pipe';
import { TProductRewardPool, TPromotionProductBase } from '../../../types/crm-promotion.type';

@Component({
  selector: 'app-promotion-gift',
  imports: [ProductPickerComponent, ProductNamePipe],
  templateUrl: './promotion-gift.component.html',
  styles: '',
})
export class PromotionGiftComponent {
  rewardPool = model.required<TProductRewardPool[]>()
  onAddProduct(products: TPromotionProductBase[]) {
    this.rewardPool.update(prev => [...prev, ...products.map(product => ({ ...product, itemBenefitType: 'PRICE', itemBenefitValue: 0 }))])
  }
}
