import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { TBorchureHead, TColor, TGroupItemList, TItem, TItemList, TMarketingParams, TMaybe } from '../../../types';
import { tap } from 'rxjs';
import { IBrochureService, transformItemList } from '../../../lib';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MarketingService implements IBrochureService {


  private readonly setState = ({ wholeName, wholeType, zone, promotionType, promotion, isNewCustomer, fromDate, toDate }: TItemList) => {
    this.head.update(() => ({ wholeName, wholeType, zone, promotionType, isNewCustomer, fromDate, toDate }))
    const size = 12
    this.content.update(() => promotion.reduce<TItem[][]>(transformItemList(size), [[]]))
  }


  head = signal<TMaybe<TBorchureHead>>(null)
  content = signal<TGroupItemList>([[]])
  maxItem = signal<12>(12)
  totalPage = computed(() => Array.from({ length: this.content().length }).map((_, idx) => idx))
  color = computed<TColor>(() => this.head()?.zone === "BKK" ? "purple" : "green")


  private readonly api = inject(ApiService);

  private readonly url = environment.brochureEndpoint

  getBrochureList({ promoType, wholeType, isNewCustomer, isBkk, token, idPromotion }: TMarketingParams) {
    return this.api.get<TItemList>(`${this.url}/PaperPro/V2`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        ProType: promoType,
        IsBkk: isBkk,
        IsNewCustomer: isNewCustomer,
        WholeTypeGroup: wholeType,
        IdPromotion: Number(idPromotion)
      }
    }).pipe(tap(this.setState))
  }

}


