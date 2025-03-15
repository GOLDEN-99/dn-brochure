import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TCardProps, TItemList, TPromotionType } from '../../types';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProchureService {

  constructor() { }

  private api = inject(ApiService)
  private url = environment.brochureEndpoint

  getProchureList(wholeCode: string, promoType: TPromotionType) {
    return this.api.get<TItemList>(`${this.url}/${wholeCode}/${promoType}`)
  }
}