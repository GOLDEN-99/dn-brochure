import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TShopRecord } from '../../types';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  constructor() { }
  private api = inject(ApiService)

  search(term: string) {
    // return this.api.get<TShopRecord[]>("")
    if (term === "") return of(mockshop)
    return of(mockshop.filter(({ shopName }) => shopName.includes(term)))
  }

}

const mockshop: TShopRecord[] = [
  {
    id: 1,
    shopName: 'shop 1'
  },
  {
    id: 2,
    shopName: 'shop 2'
  },
  {
    id: 3,
    shopName: 'shop 3'
  },
  {
    id: 4,
    shopName: 'shop 4'
  },
  {
    id: 5,
    shopName: 'shop 5'
  },
  {
    id: 6,
    shopName: 'shop 6'
  },
  {
    id: 7,
    shopName: 'shop 7'
  },
  {
    id: 8,
    shopName: 'shop 8'
  },
  {
    id: 9,
    shopName: 'shop 9'
  },
  {
    id: 10,
    shopName: 'shop 10'
  },
]