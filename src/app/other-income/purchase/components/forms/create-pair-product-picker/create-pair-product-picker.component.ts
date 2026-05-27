import { Component, computed, inject, input } from '@angular/core';
import { OtherIncomeSearchProductService } from '../../../services/other-income-search-product.service';
import { FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'other-income-create-pair-product-picker',
  imports: [],
  templateUrl: './create-pair-product-picker.component.html',
  styles: '',
  providers: [OtherIncomeSearchProductService]
})
export class CreatePairProductPickerComponent {
  productForm = input.required<FieldTree<Array<TOtherIncomeProductItemState>>>()
  private readonly productService = inject(OtherIncomeSearchProductService)
  dnCompCode = this.productService.dnCompCode
  huCompCode = this.productService.huCompCode
  dnProduct = this.productService.dnProductResult
  huProduct = this.productService.huProductResult
  // merge distincet product
  mergedProduct = computed(() => {
    let ref = new Set<string>();
    let result: TOtherIncomeProductItemState[] = []
    for (const product of this.dnProduct()) {
      if (!ref.has(product.goodCode)) {
        result.push(product);
        ref.add(product.goodCode);
      }
    }
    for (const product of this.huProduct()) {
      if (!ref.has(product.goodCode)) {
        result.push(product);
        ref.add(product.goodCode);
      }
    }
    return result;
  })

  formProductRef = computed(() => new Set(this.productForm()().value().map(p => p.goodCode)))
  renderableProduct = computed(() => {
    const containedProduct = this.formProductRef()
    return this.mergedProduct().filter(p => !containedProduct.has(p.goodCode))
  })
}


type TOtherIncomeProductItemState = {
  goodCode: string
  goodName: string
  barCode: string
}