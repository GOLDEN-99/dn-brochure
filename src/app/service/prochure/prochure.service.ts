import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TBorchureHead, TColor, TGroupItemList, TItemList, TMaybe, TPromotionType } from '../../types';
import { environment } from '../../../environments/environment';
import { IBrochureService, transformItemList } from '../../lib';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProchureService implements IBrochureService {

  constructor() { }

  head = signal<TMaybe<TBorchureHead>>(null)
  content = signal<TGroupItemList>([[]])
  maxItem = computed(() => this.head()?.promotionType === 'Hot' ? 8 : 12)
  totalPage = computed(() => [...Array(this.content().length)].map((_, idx) => idx))
  color = computed<TColor>(() => this.head()?.zone === "BKK" ? "purple" : "green")

  private api = inject(ApiService)
  private url = environment.brochureEndpoint

  private setState = ({ wholeName, wholeType, zone, promotionType, promotion, isNewCustomer, fromDate, toDate }: TItemList) => {
    this.head.update(() => ({ wholeName, wholeType, zone, promotionType, isNewCustomer, fromDate, toDate }))
    const size = promotionType === "Hot" ? 8 : 12
    this.content.update(() => promotion.reduce(transformItemList(size), [[]]))
  }

  getProchureList(wholeCode: string, promoType: TPromotionType) {
    return this.api.get<TItemList>(`${this.url}/${wholeCode}/${promoType}`).pipe(tap(this.setState))
  }
}