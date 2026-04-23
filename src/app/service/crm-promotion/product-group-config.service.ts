import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { ProductConfigService } from './product-config.service';

@Injectable()
export class ProductGroupConfigService {
  private readonly productConfig = inject(ProductConfigService)


  // private readonly productInGroup$ = toObservable(this.groupId).pipe(
  //   map(Number),
  //   filter(v => !Number.isNaN(v)),
  //   switchMap(id => this.productConfig.getAllProductGroup(id).pipe(catchError(() => of([]))))
  // )

  // readonly currentProductInGroup = toSignal(this.productInGroup$, { initialValue: [] })
  // readonly currentProductSet = computed(() =>
  //   new Set(this.currentProductInGroup().map(p => p.goodCode))
  // )

  readonly allProducts = this.productConfig.allProduct

  refetchAllProducts() { this.productConfig.refetchAllProducts() }

  addProducts(groupId: number | undefined, goodCodes: string[]) {
    if (!groupId) throw new Error('groupId not set')
    return this.productConfig.addProductToGroup(groupId, goodCodes)
  }

  deleteProduct(listId: number) {
    return this.productConfig.deleteProductFromGroup(listId)
  }

  readonly allProductCate = this.productConfig.allProductCate
  readonly allProductType = this.productConfig.allProductType
  readonly allProductGroup = this.productConfig.allProductGroup
}
