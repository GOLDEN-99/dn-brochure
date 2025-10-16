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
  private getProduct = (compCode: string, compType: string, name: string) => this.api.get<TSearchProductResult[]>(`${this.url}/${compType}`, { params: { compCode } })
  private product$: Observable<TAppSearchProductResult[]> = this.params$
    .pipe(
      filter(([compCode]) => compCode !== ''),
      distinctUntilChanged((prev, cur) => {
        if (prev[1] !== cur[1]) return false
        return prev[0] === cur[0]
      }),
      switchMap(([compCode, compType, term]) => this.getProduct(compCode, compType, term)),
      map((products) => products.map(this.mapCheckToProduct))
    )
  product = signal<TAppSearchProductResult[]>([])
  toggleProduct = (goodCode: string) => {
    this.product.update(prev => prev.map(product => product.goodCode === goodCode ? ({ ...product, check: !product.check }) : product))
  }

  uncheckProduct = (goodCode: string) => this.product.update(prev => prev.map(p => p.goodCode === goodCode ? ({ ...p, check: false }) : p))

  selectAll = (isCheck: boolean) => this.product.update(prev => prev.map(p => ({ ...p, check: isCheck })))


  private mapCheckToProduct = ({ barCode, goodCode, goodName }: TSearchProductResult): TAppSearchProductResult => {
    return { goodCode, goodName: `(${barCode}) ${goodName}`, check: false }
  }
}

export type TSearchProductResult = {
  goodCode: string
  goodName: string
  barCode: string
}
export type TAppSearchProductResult = { check: boolean } & Omit<TSearchProductResult, 'barCode'>
