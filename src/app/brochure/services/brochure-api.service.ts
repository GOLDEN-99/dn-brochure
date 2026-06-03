import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { TFlashSaleResponse, TItemList } from '../types/brochure.type';
import { TFlashParams, TMarketingParams, TNormalParams } from '../utils/param-schema';

@Injectable({
  providedIn: 'root',
})
export class BrochureApiService {
  private readonly api = inject(ApiService);
  private readonly url = environment.brochureEndpoint

  getFlashSale = (req: TFlashParams) =>
    this.api.post<TFlashSaleResponse>(`${this.url}/PaperProFlash`, req)

  getSpecialBrochureList({ promoType, wholeType, isNewCustomer, isBkk, token, idPromotion }: TMarketingParams) {
    return this.api.get<TItemList>(`${this.url}/PaperPro/V2`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        ProType: promoType,
        IsBkk: isBkk,
        IsNewCustomer: isNewCustomer,
        WholeTypeGroup: wholeType,
        IdPromotion: idPromotion
      }
    })
  }

  getBrochureList({ wholeCode, promoType }: TNormalParams) {
    return this.api.get<TItemList>(`${this.url}/PaperPro/${wholeCode}/${promoType}`)
  }
}


