import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Observable, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OiProductService {

  constructor() {
    this.product$
      .pipe(map(products => products.map(this.mapCheckToProduct)))
      .subscribe(res => this.product.set(res))
  }
  private api = inject(ApiService)
  private url = `${environment.oi}/other-income/product`
  term = signal('')
  private term$ = toObservable(this.term).pipe(filter(term => term !== ''))
  private getProduct = (name: string) => this.api.get<TSearchProductResult[]>(this.url, { params: { name } })
  private product$: Observable<TAppSearchProductResult[]> = this.term$
    .pipe(switchMap(this.getProduct))
    .pipe(
      map((products) => products.map(this.mapCheckToProduct))
    )
  product = signal<TAppSearchProductResult[]>([])
  toggleProduct = (goodCode: string) => {
    this.product.update(prev => prev.map(product => product.goodCode === goodCode ? ({ ...product, check: !product.check }) : product))
  }

  selectAll = (isCheck: boolean) => this.product.update(prev => prev.map(p => ({ ...p, check: isCheck })))


  private mapCheckToProduct = (product: TSearchProductResult) => {
    // const hasCheck = this.checked.has(product.goodCode)
    return { ...product, check: false }
  }
}

type TSearchProductResult = { goodCode: string, goodName: string }
type TAppSearchProductResult = { check: boolean } & TSearchProductResult
