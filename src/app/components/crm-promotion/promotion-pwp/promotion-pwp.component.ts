import { Component, model } from '@angular/core';
import { TProductRewardPool, TPromotionProductBase } from '../../../types/crm-promotion.type';
import { ProductPickerComponent } from "../product-picker/product-picker.component";
import { ProductNamePipe } from '../../../lib/crm-promotion/product-name.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-promotion-pwp',
  imports: [ProductPickerComponent, ProductNamePipe, FormsModule],
  templateUrl: './promotion-pwp.component.html',
  styles: '',
})
export class PromotionPwpComponent {
  rewardPool = model.required<TProductRewardPool[]>()

  readonly pwpBenefitTypes = [
    { value: 'PRICE', label: 'ปรับราคาเป็น' },
    { value: 'BATHDISC', label: 'ลดเป็นบาท' },
    { value: 'PERCENTDISC', label: 'ลดเป็นเปอร์เซ็นต์' },
  ]

  onAddProduct(products: TPromotionProductBase[]) {
    this.rewardPool.update(prev => [
      ...prev,
      ...products.map(product => ({ ...product, itemBenefitType: 'PRICE', itemBenefitValue: 0 }))
    ])
  }

  onRemoveProduct(goodCode: string) {
    this.rewardPool.update(prev => prev.filter(p => p.goodCode !== goodCode))
  }

  onChangeBenefitType(goodCode: string, itemBenefitType: string) {
    this.rewardPool.update(prev =>
      prev.map(p => p.goodCode === goodCode ? { ...p, itemBenefitType } : p)
    )
  }

  onChangeBenefitValue(goodCode: string, itemBenefitValue: number) {
    this.rewardPool.update(prev =>
      prev.map(p => p.goodCode === goodCode ? { ...p, itemBenefitValue } : p)
    )
  }
}
