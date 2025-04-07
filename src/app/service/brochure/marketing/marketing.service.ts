import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { TBorchureHead, TColor, TGroupItemList, TItemList, TMarketingParams, TMaybe } from '../../../types';
import { tap } from 'rxjs';
import { IBrochureService, transformItemList } from '../../../lib';


@Injectable({
  providedIn: 'root'
})
export class MarketingService implements IBrochureService {

  constructor() {
  }

  private setState = ({ wholeName, wholeType, zone, promotionType, promotion, isNewCustomer }: TItemList) => {
    this.head.update(() => ({ wholeName, wholeType, zone, promotionType, isNewCustomer }))
    const size = promotionType === "Hot" ? 8 : 12
    this.content.update(() => promotion.reduce(transformItemList(size), [[]]))
  }


  head = signal<TMaybe<TBorchureHead>>(null)
  content = signal<TGroupItemList>([[]])
  maxItem = computed(() => this.head()?.promotionType === 'Hot' ? 8 : 12)
  totalPage = computed(() => [...Array(this.content().length)].map((_, idx) => idx))
  color = computed<TColor>(() => this.head()?.zone === "BKK" ? "purple" : "green")


  private api = inject(ApiService);

  private url = "https://api.drugnetcenter.com/ItemService2/PaperPro/v2"

  getBrochureList({ promoType, wholeType, isNewCustomer, isBkk, token, idPromotion }: TMarketingParams) {
    return this.api.get<TItemList>(this.url, {
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


