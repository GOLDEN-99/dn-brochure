import { Component, computed, input } from '@angular/core';
import { TPromotionBenefit, TPromotionProductBase } from '../../../types/crm-promotion.type';
import { ProductPickerComponent } from "../product-picker/product-picker.component";
import { ProductNamePipe } from '../../../lib/crm-promotion/product-name.pipe';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormAlertTextComponent } from "../form-alert-text.component";

@Component({
  selector: 'app-promotion-pwp',
  imports: [ProductPickerComponent, ProductNamePipe, FormsModule, FormField, FormAlertTextComponent],
  templateUrl: './promotion-pwp.component.html',
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

  onRemoveProduct(goodCode: string) {
    this.rewardForm().rewardPool().controlValue.update(prev => prev.filter(p => p.goodCode !== goodCode))
  }

  onChangeBenefitType(goodCode: string, itemBenefitType: string) {
    this.rewardForm().rewardPool().controlValue.update(prev =>
      prev.map(p => p.goodCode === goodCode ? { ...p, itemBenefitType } : p)
    )
  }

  onChangeBenefitValue(goodCode: string, itemBenefitValue: number) {
    this.rewardForm().rewardPool().controlValue.update(prev =>
      prev.map(p => p.goodCode === goodCode ? { ...p, itemBenefitValue } : p)
    )
  }
}
