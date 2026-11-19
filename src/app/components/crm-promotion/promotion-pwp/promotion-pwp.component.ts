import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { TPromotionBenefit, TPromotionProductBase } from '../../../types/crm-promotion.type';
import { ProductPickerComponent } from "../product-picker/product-picker.component";
import { ProductNamePipe } from '../../../lib/crm-promotion/product-name.pipe';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormAlertTextComponent } from "../form-alert-text.component";
import { sameProduct } from '../../../lib/crm-promotion/product-key';

@Component({
  selector: 'app-promotion-pwp',
  imports: [ProductPickerComponent, ProductNamePipe, FormsModule, FormField, FormAlertTextComponent],
  templateUrl: './promotion-pwp.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: '',
})
export class PromotionPwpComponent {
  rewardForm = input.required<FieldTree<TPromotionBenefit>>()
  readonly rewards = computed(() => this.rewardForm().rewardPool().value())

  readonly pwpBenefitTypes = [
    { value: 'PRICE', label: 'ปรับราคาเป็น' },
    { value: 'BATHDISC', label: 'ลดเป็นบาท' },
    { value: 'PERCENTDISC', label: 'ลดเป็นเปอร์เซ็นต์' },
  ]

  onAddProduct(products: TPromotionProductBase[]) {
    this.rewardForm().rewardPool().controlValue.update(prev => [
      ...prev,
      ...products.map(product => ({ ...product, itemBenefitType: 'PRICE', itemBenefitValue: 0 }))
    ])
  }

  // Rows are addressed by the pair (good, unit), never by goodCode alone: the same good in two
  // units is two claimable SKUs with possibly different benefits.
  onRemoveProduct(product: TPromotionProductBase) {
    this.rewardForm().rewardPool().controlValue.update(prev => prev.filter(p => !sameProduct(p, product)))
  }

  onChangeBenefitType(product: TPromotionProductBase, itemBenefitType: string) {
    this.rewardForm().rewardPool().controlValue.update(prev =>
      prev.map(p => sameProduct(p, product) ? { ...p, itemBenefitType } : p)
    )
  }

  onChangeBenefitValue(product: TPromotionProductBase, itemBenefitValue: number) {
    this.rewardForm().rewardPool().controlValue.update(prev =>
      prev.map(p => sameProduct(p, product) ? { ...p, itemBenefitValue } : p)
    )
  }
}
