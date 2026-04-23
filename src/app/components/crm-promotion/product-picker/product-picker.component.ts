import { Component, computed, inject, input, output } from '@angular/core';
import { ProductConfigService } from '../../../service/crm-promotion/product-config.service';
import { LoadingService } from '../../../service/loading/loading.service';
import { ToastService } from '../../../service/toast/toast.service';
import { debounceTime, distinctUntilChanged, finalize, map, Observable } from 'rxjs';
import { TConfigGroup, TPromotionProductBase } from '../../../types/crm-promotion.type';
import { NgbTypeaheadSelectItemEvent, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-picker',
  imports: [NgbTypeahead, FormsModule],
  templateUrl: './product-picker.component.html',
  styleUrl: './product-picker.component.scss',
})
export class ProductPickerComponent {
  //binding
  disabled = input(false)
  exclusionPool = input<TPromotionProductBase[]>([])
  productAdd = output<TPromotionProductBase[]>()
  //productRemove = output<string>()

  private readonly exclusionSet = computed(() =>
    new Set(this.exclusionPool().map(({ goodCode }) => goodCode))
  )
  //di
  private readonly productService = inject(ProductConfigService)
  private readonly allProducts = this.productService.allProduct
  private readonly loadingService = inject(LoadingService)
  private readonly toastService = inject(ToastService)
  private readonly promotionProductGroup = this.productService.allPromotionProductGroup
  // state
  //// filter out excluded products
  validProduct = computed(() => {
    const ref = this.exclusionSet();
    return this.allProducts().filter(p => !ref.has(p.goodCode))
  })

  // type ahead method
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
  formatProduct({ sku, goodName }: TPromotionProductBase) {
    return `(${sku}) ${goodName}`
  }
  formatGoodName({ goodName }: TPromotionProductBase) {
    return goodName
  }
  // emit value out
  onSelectProduct({ item: { goodCode, goodName, sku } }: NgbTypeaheadSelectItemEvent<TPromotionProductBase>) {
    this.productAdd.emit([{ goodCode, goodName, sku }])
  }
  // onRemoveProduct(goodCode: string) {
  //   this.productRemove.emit(goodCode)
  // }
  // handle add product from group
  searchPromotionProductGroup(term$: Observable<string>) {
    return term$.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      map(t => this.promotionProductGroup().filter(p =>
        p.name.toLocaleLowerCase().includes(t))
      ))
  }
  formatPromotionProductGroup({ name }: TConfigGroup) {
    return name
  }
  onSelectpromoitionproductGroup({ item: { id } }: NgbTypeaheadSelectItemEvent<TConfigGroup>) {
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
