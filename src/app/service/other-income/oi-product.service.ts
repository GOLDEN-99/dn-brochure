import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounce, debounceTime, distinctUntilChanged, filter, map, Observable, Subject, switchMap, tap } from 'rxjs';

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
  private compCode$ = new Subject<string>()
  private compType$ = new Subject<string>()
  setComp(compCode: string, compType: string) {
    this.compCode$.next(compCode);
    this.compType$.next(compType);
  }
  private term$ = toObservable(this.term).pipe(
    debounceTime(300)
  )
  private params$ = combineLatest([this.compCode$, this.compType$, this.term$])
  private getProduct = (compCode: string, compType: string, name: string) => this.api.get<TSearchProductResult[]>(`${this.url}/${compType}`, { params: { name, compCode } })
  private product$: Observable<TAppSearchProductResult[]> = this.params$
    .pipe(switchMap(([compCode, compType, term]) => this.getProduct(compCode, compType, term)))
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
