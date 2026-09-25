import { Component, computed, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ProductConfigService } from '../../../service/crm-promotion/product-config.service';
import { LoadingService } from '../../../service/loading/loading.service';
import { ToastService } from '../../../service/toast/toast.service';
import { finalize } from 'rxjs';
import { TConfigGroup, TPromotionProductBase } from '../../../types/crm-promotion.type';
import { SearchPickerComponent } from '../search-picker/search-picker.component';

@Component({
  selector: 'app-product-picker',
  imports: [SearchPickerComponent],
  templateUrl: './product-picker.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-picker.component.scss',
})
export class ProductPickerComponent {
  //binding
  disabled = input(false)
  exclusionPool = input<TPromotionProductBase[]>([])
  productAdd = output<TPromotionProductBase[]>()

  private readonly exclusionSet = computed(() =>
    new Set(this.exclusionPool().map(({ goodCode }) => goodCode))
  )
  //di
  private readonly productService = inject(ProductConfigService)
  private readonly allProducts = this.productService.allProduct
  private readonly loadingService = inject(LoadingService)
  private readonly toastService = inject(ToastService)
  readonly promotionProductGroup = this.productService.allPromotionProductGroup
  // state
  //// filter out excluded products
  validProduct = computed(() => {
    const ref = this.exclusionSet();
    return this.allProducts().filter(p => !ref.has(p.goodCode))
  })

  // search picker accessors
  readonly goodName = ({ goodName }: TPromotionProductBase) => goodName
  readonly sku = ({ sku }: TPromotionProductBase) => sku
  readonly formatProduct = ({ sku, goodName }: TPromotionProductBase) => `(${sku}) ${goodName}`
  readonly groupName = ({ name }: TConfigGroup) => name

  // emit value out
  onSelectProduct({ goodCode, goodName, sku }: TPromotionProductBase) {
    this.productAdd.emit([{ goodCode, goodName, sku }])
  }
  // handle add product from group
  onSelectpromoitionproductGroup({ id }: TConfigGroup) {
    this.loadingService.startLoad()
    this.productService.getAllProductGroup(id).pipe(
      finalize(() => this.loadingService.endLoad())
    ).subscribe({
      next: (v) => {
        const ref = this.exclusionSet()
        const incoming = v.flatMap(({ goodCode, goodName, sku }) => ref.has(goodCode) ? [] : [{ goodCode, goodName, sku }])
        this.productAdd.emit(incoming)
      },
      error: () => {
        this.toastService.danger('ไม่สามารถดึงค่า set สินค้าได้')
      }
    })
  }
}
