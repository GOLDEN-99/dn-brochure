import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, Subject, switchMap } from 'rxjs';
import { ProductConfigService } from './product-config.service';

@Injectable()
export class ProductGroupConfigService {
  private readonly productConfig = inject(ProductConfigService)

  readonly groupId = signal<number | undefined>(undefined)

  private readonly productInGroup$ = toObservable(this.groupId).pipe(
    map(Number),
    filter(v => !Number.isNaN(v)),
    switchMap(id => this.productConfig.getAllProductGroup(id)),
    catchError(() => of([]))
  )

  readonly currentProductInGroup = toSignal(this.productInGroup$, { initialValue: [] })
  readonly currentProductSet = computed(() =>
    new Set(this.currentProductInGroup().map(p => p.goodCode))
  )

  // lazy-loaded — call loadAllProducts() once when the add page opens
  private readonly loadAllProducts$ = new Subject<void>()
  readonly allProducts = toSignal(
    this.loadAllProducts$.pipe(switchMap(() => this.productConfig.fetchAllProducts())),
    { initialValue: [] }
  )

  loadAllProducts() {
    this.loadAllProducts$.next()
  }

  addProducts(goodCodes: string[]) {
    const id = this.groupId()
    if (!id) throw new Error('groupId not set')
    return this.productConfig.addProductToGroup(id, goodCodes)
  }

  readonly allProductCate = this.productConfig.allProductCate
  readonly allProductType = this.productConfig.allProductType
  readonly allProductGroup = this.productConfig.allProductGroup
}
