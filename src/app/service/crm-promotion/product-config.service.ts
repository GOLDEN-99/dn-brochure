import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { TConfigGroup, TProductCate, TProductDetail, TProductGroup, TProductType } from '../../types/crm-promotion.type';

@Injectable({
  providedIn: 'root'
})
export class ProductConfigService {


  private readonly api = inject(ApiService)
  private readonly basePath = environment.oi + '/crm'

  private readonly refetchPromotionProductGroupSig = signal(0)
  private readonly refetchBranchGroup$ = toObservable(this.refetchPromotionProductGroupSig)
  fetchAllProducts() {
    return this.api.get<TProductDetail[]>(`${this.basePath}/all-products`)
  }
  private readonly allPromotionProductGroup$ = this.refetchBranchGroup$.pipe(
    switchMap(() => this.api.get<TConfigGroup[]>(`${this.basePath}/promotion-product-groups`))
  )
  allProductCate = toSignal(
    this.api.get<TProductCate[]>(`${this.basePath}/product-categories`),
    { initialValue: [] }
  )
  allProductType = toSignal(
    this.api.get<TProductType[]>(`${this.basePath}/product-types`),
    { initialValue: [] }
  )
  allProductGroup = toSignal(
    this.api.get<TProductGroup[]>(`${this.basePath}/product-good-groups`),
    { initialValue: [] }
  )
  allPromotionProductGroup = toSignal(this.allPromotionProductGroup$, { initialValue: [] })
  createPromotionProductGroup(req: { name: string }) {
    return this.api.post(`${this.basePath}/promotion-product-groups`, req)
  }
  refetchPromotionProductGroup() {
    this.refetchPromotionProductGroupSig.update(v => v + 1)
  }
  // private readonly allBranchZone$ = this.api.get<TBranchZoneDetail[]>(`${this.basePath}/branch-zones`)
  // allBranchZone = toSignal(this.allBranchZone$, { initialValue: [] })

  // private readonly allOldBranchGroup$ = this.api.get<TBranchGroupDetail[]>(`${this.basePath}/branch-old-groups`)
  // allOldBranchGroup = toSignal(this.allOldBranchGroup$, { initialValue: [] })

  getAllProductGroup(groupId: number) {
    return this.api.get<TProductDetail[]>(`${this.basePath}/promotion-product-groups/${groupId}/items`)
  }

  addProductToGroup(groupId: number, goodCodes: string[]) {
    return this.api.post<void>(`${this.basePath}/promotion-product-groups/${groupId}/items`, { goodCodes })
  }

}
