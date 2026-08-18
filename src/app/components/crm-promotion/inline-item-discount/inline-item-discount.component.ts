import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { TConfigGroup, TInlinePool, TProductDetail } from '../../../types/crm-promotion.type';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { ProductConfigService } from '../../../service/crm-promotion/product-config.service';
import { form, FormField } from '@angular/forms/signals';
import { initialData, productDiscountSchema } from './productScheme';
import { LoadingService } from '../../../service/loading/loading.service';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-inline-item-discount',
  imports: [FormsModule, NgbTypeahead, FormField],
  templateUrl: './inline-item-discount.component.html',
  styleUrl: './inline-item-discount.component.scss',
})
export class InlineItemDiscountComponent {
  private readonly productService = inject(ProductConfigService)
  private readonly allProducts = this.productService.allProduct
  private readonly loadingService = inject(LoadingService)
  private readonly toastService = inject(ToastService)
  promotionProductGroup = this.productService.allPromotionProductGroup

  searchPromotionProductGroup(term$: Observable<string>) {
    return term$.pipe(map(t => this.promotionProductGroup().filter(p => p.name.toLocaleLowerCase().includes(t.toLocaleLowerCase()))))
  }
  formatPromotionProductGroup({ name }: TConfigGroup) {
    return name
  }
  onSelectpromoitionproductGroup({ item: { id } }: NgbTypeaheadSelectItemEvent<TConfigGroup>) {
    this.loadingService.startLoad()
    return this.productService.getAllProductGroup(id).subscribe({
      next: (v) => {
        const incomeing = Object.fromEntries(Object.entries(v).map(([k, { goodCode, goodName, sku }]) => ([k, { goodCode, goodName, sku, discount: 0 }])))
        this.productModel.update(prev => ({ ...incomeing, ...prev }))
      },
      error: (e) => {
        this.toastService.danger('ไม่สามารถดึงค่า set สินค้าได้')
      },
      complete: () => { this.loadingService.endLoad() }
    })
  }

  readonly benefitType = model.required<string>()
  readonly inlinePool = model.required<TInlinePool[]>()

  isBenefitBath = computed(() => this.benefitType() === "BATH")
  isBenefitPercent = computed(() => this.benefitType() === "PERCENT")
  isBenefitPrice = computed(() => this.benefitType() === "PRICE")

  cannotChangeBenefit = computed(() => this.inlinePool().length !== 0)

  productModel = signal(initialData)
  productList = computed(() => Object.entries(this.productModel().productMap).map(([_, v]) => v))
  currentProduct = computed(() => new Set(Object.keys(this.productModel().productMap)))
  validProduct = computed(() => {
    const ref = this.currentProduct();
    return this.allProducts().filter(p => !ref.has(p.goodCode))
  })

  productForm = form(this.productModel, productDiscountSchema)
  // selectProduct = signal<TMaybe<TProductDetail>>(null)
  formatProduct({ sku, goodName }: Pick<TProductDetail, 'goodName' | 'sku' | 'goodCode'>) {
    return `(${sku}) ${goodName}`
  }
  formatGoodName({ goodName }: TProductDetail) {
    return goodName
  }
  onSelectProduct({ item: { goodCode, goodName, sku } }: NgbTypeaheadSelectItemEvent<TProductDetail>) {
    this.productModel.update(({ productMap }) => ({ productMap: { ...productMap, [goodCode]: { goodCode, goodName, sku, benefitBath: 0, benefitPercent: 0, benefitPrice: 0, pwpCount: 0 } } }))
  }
  onRemoveProduct(goodCode: string) {
    this.productModel.update(({ productMap }) => {
      const { [goodCode]: _, ...rest } = productMap
      return { productMap: rest }
    })
  }
  onSearchName = (term$: Observable<string>) => term$.pipe(
    distinctUntilChanged(),
    debounceTime(300),
    map(t => this.validProduct().filter(p => p.goodName.toLocaleLowerCase().includes(t.toLocaleLowerCase())).slice(0, 10))
  )
  onSearchSku = (term$: Observable<string>) => term$.pipe(
    distinctUntilChanged(),
    debounceTime(300),
    map(t => this.validProduct().filter(p => p.sku.includes(t)).slice(0, 10))
  )
  disableSubmitButton = computed(() => {
    const { dirty, invalid } = this.productForm()
    return !dirty() || invalid()
  })
  onSubmit() {
    this.inlinePool.update(prev => [
      ...prev,
      ...this.productList()
    ])
    this.productModel.set({ productMap: {} })
  }
}
