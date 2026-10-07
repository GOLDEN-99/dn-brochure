import { Component, computed, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ProductConfigService } from '../../../service/crm-promotion/product-config.service';
import { LoadingService } from '../../../service/loading/loading.service';
import { ToastService } from '../../../service/toast/toast.service';
import { finalize } from 'rxjs';
import { TConfigGroup, TProductDetail, TPromotionProductBase } from '../../../types/crm-promotion.type';
import { SearchPickerComponent } from '../search-picker/search-picker.component';
import { formatProductLabel, productKey } from '../../../lib/crm-promotion/product-key';

// Picker rows are (good, unit, supplier) -- see TProductDetail. A good sold as strip and box
// shows twice, labelled by unit; picking one adds that pair only, and the other stays offered.
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
    new Set(this.exclusionPool().map(productKey))
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
    return this.allProducts().filter(p => !ref.has(productKey(p)))
  })

  // search picker accessors
  readonly goodName = ({ goodName }: TProductDetail) => goodName
  // the 6-digit sku, or the unit's own scan code -- a pack unit has no 6-digit code
  readonly sku = ({ sku, barcode }: TProductDetail) => `${sku ?? ''} ${barcode ?? ''}`
  readonly formatProduct = (p: TProductDetail) => formatProductLabel(p)
  readonly groupName = ({ name }: TConfigGroup) => name

  // emit value out
  onSelectProduct(product: TProductDetail) {
    this.productAdd.emit([toBase(product)])
  }
  // handle add product from group
  onSelectpromoitionproductGroup({ id }: TConfigGroup) {
    this.loadingService.startLoad()
    this.productService.getAllProductGroup(id).pipe(
      finalize(() => this.loadingService.endLoad())
    ).subscribe({
      next: (v) => {
        const ref = this.exclusionSet()
        const incoming = v.flatMap(p => ref.has(productKey(p)) ? [] : [toBase(p)])
        this.productAdd.emit(incoming)
      },
      error: () => {
        this.toastService.danger('ไม่สามารถดึงค่า set สินค้าได้')
      }
    })
  }
}

const toBase = ({ goodCode, goodName, sku, unitCode, unitDesc, unitFactor, barcode }: TProductDetail): TPromotionProductBase =>
  ({ goodCode, goodName, sku, unitCode: unitCode ?? null, unitDesc: unitDesc ?? null, unitFactor: unitFactor ?? null, barcode: barcode ?? null })
