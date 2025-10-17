import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { catchErrorAndRethrow, getOrElse } from '../../lib/utli';
import { TStockSetup } from '../../types';
import { TSearchProductResult } from '../other-income/oi-product.service';

@Injectable({
  providedIn: 'root'
})
export class StockItemApiService {

  constructor() { }

  private _search_product_url = `${environment.oi}/products`
  private _stock_item_url = `${environment.oi}/stock-item`

  private api = inject(ApiService)
  private _initialSearchValue = { goodCode: "", goodName: "" }
  searchProductTerm = signal(this._initialSearchValue)
  resetSearch = () => this.searchProductTerm.set(this._initialSearchValue)
  private searchProductTerm$ = toObservable(this.searchProductTerm)
    .pipe(
      distinctUntilChanged((prev, cur) => prev.goodCode === cur.goodCode && prev.goodName === cur.goodName),
      debounceTime(300)
    )
  private searchProduct = ({ goodCode: barcode, goodName }: { goodCode: string; goodName: string }) => {
    if (goodName === '' && barcode === '') return of([])
    return this.api.get<TBaseProduct[]>(`${this._search_product_url}`, { params: { barcode, goodName } }).pipe(catchErrorAndRethrow())
  }
  private searchResult$ = this.searchProductTerm$.pipe(
    switchMap(t => this.searchProduct(t)),
    getOrElse<TBaseProduct[]>([])
  )
  searchProductResult = toSignal(this.searchResult$, { initialValue: [] })

  private fetchSetup = new BehaviorSubject(true);
  refreshSetup = () => this.fetchSetup.next(true);
  private getSetup = () =>
    this.api.get<TStockSetup[]>(`${this._stock_item_url}/criteria`)
      .pipe(catchErrorAndRethrow())

  addSetup = (req: Omit<TStockSetup, 'id'>) => this.api
    .post(`${this._stock_item_url}/criteria`, req)
    .pipe(tap(() => this.refreshSetup()))

  updateSetup = ({ id, ...res }: TStockSetup) => this.api
    .post(`${this._stock_item_url}/criteria/${id}`, res)
    .pipe(tap(() => this.refreshSetup()))

  deleteSetup = (id: number) => this.api.delete(`${this._stock_item_url}/criteria/${id}`)
    .pipe(tap(() => this.refreshSetup()))

  private setup$: Observable<TStockSetup[]> =
    this.fetchSetup
      .pipe(
        switchMap(_ => this.getSetup()),
        getOrElse([])
      )
  setup = toSignal(this.setup$, { initialValue: [] })

  getGoodGP = (goodCode: string) => {
    if (goodCode === '') return of(null)
    return this.api.get<TGPResponse>(`${this._stock_item_url}/good/${goodCode}`).pipe(getOrElse(null))
  }

}


type TBaseProduct = {
  goodCode: string
  goodName: string
  barCode: string
  goodStat: boolean
}

type TGPResponse = {
  goodCode: string
  dnCost: number
  priceW3: number
}