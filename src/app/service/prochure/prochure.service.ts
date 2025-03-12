import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TCardProps } from '../../types';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProchureService {

  constructor() { }

  private api = inject(ApiService)

  getProchureList(id: string) {
    return of(mockProchure)
  }
}

const mockProchure: TCardProps[] = [
  {
    name: 'product 1',
    code: 'product-code-1',
    image: 'image-1',
    priceTier: {
      standard: 1200,
      silver: 1000,
      gold: 800
    },
    displayPrice: 1200,
    isFlag: true
  },
  {
    name: 'product 2',
    code: 'product-code-2',
    image: 'image-2',
    priceTier: {
      standard: 1200,
      silver: 1000,
      gold: 800
    },
    displayPrice: 1200,
    isFlag: true
  },
  {
    name: 'product 3',
    code: 'product-code-3',
    image: 'image-3',
    priceTier: {
      standard: 1200,
      silver: 1000,
      gold: 800
    },
    displayPrice: 1200,
    isFlag: false
  },
  {
    name: 'product 4',
    code: 'product-code-4',
    image: 'image-4',
    priceTier: {
      standard: 1200,
      silver: 1000,
      gold: 800
    },
    displayPrice: 1200,
    isFlag: true
  },
  {
    name: 'product 5',
    code: 'product-code-5',
    image: 'image-5',
    priceTier: {
      standard: 1200,
      silver: 1000,
      gold: 800
    },
    displayPrice: 1200,
    isFlag: false
  },
  {
    name: 'product 6',
    code: 'product-code-6',
    image: 'image-6',
    priceTier: {
      standard: 500,
      silver: 500,
      gold: 500
    },
    displayPrice: 500,
    isFlag: false
  },
]