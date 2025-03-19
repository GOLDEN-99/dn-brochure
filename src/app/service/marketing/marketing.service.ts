import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TBorchureHead, TColor, TGroupItemList, TItem, TItemList, TMarketingParams, TMaybe, TPromotionType, TSupplier, TWhole } from '../../types';
import { Subject, switchMap, tap } from 'rxjs';
import { transformItemList } from '../../lib';


@Injectable({
  providedIn: 'root'
})
export class MarketingService {

  constructor() {
  }

  private setState = ({ wholeName, wholeType, zone, promotionType, promotion }: TItemList) => {
    this.head.update(() => ({ wholeName, wholeType, zone, promotionType }))
    const size = promotionType === "Hot" ? 6 : 9
    this.content.update(() => promotion.reduce(transformItemList(size), [[]]))
  }


  head = signal<TMaybe<TBorchureHead>>(null)
  content = signal<TGroupItemList>([[]])
  maxItem = computed(() => this.head()?.promotionType === 'Hot' ? 6 : 9)
  totalPage = computed(() => [...Array(this.content().length)].map((_, idx) => idx))
  color = computed<TColor>(() => this.head()?.zone === "BKK" ? "purple" : "green")


  private api = inject(ApiService);

  private url = "https://api.drugnetcenter.com/ItemService2/PaperPro/v2"

  getBrochureList({ promoType, wholeType, isNewCustomer, isBkk, token }: TMarketingParams) {
    return this.api.get<TItemList>(this.url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        ProType: promoType,
        IsBkk: isBkk,
        IsNewCustomer: isNewCustomer,
        WholeTypeGroup: wholeType
      }
    }).pipe(tap(this.setState))
  }

}


