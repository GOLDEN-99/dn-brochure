import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, Observable, Subject, switchMap, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { catchErrorAndRethrow, getOrElse } from '../../lib/utli';
import { TStockSetup } from '../../types';
import { TSearchProductResult } from '../other-income/oi-product.service';

@Injectable({
  providedIn: 'root'
})
export class StockItemApiService {

  constructor() { }

  private _search_product_url = `${environment.oi}/other-income/product`
  private _stock_item_url = `${environment.oi}/stock-item`
  private api = inject(ApiService)
  searhProductTerm = signal({ compCode: "", compName: "" })
  private searchProductTerm$ = toObservable(this.searhProductTerm).pipe(
    filter(({ compCode, compName }) => compCode !== "" || compName !== ''),
    distinctUntilChanged((prev, cur) => prev.compCode === cur.compCode && prev.compName === cur.compName),
    debounceTime(300)
  )
  private searchProduct = (params: { compCode: string; compName: string }) =>
    this.api.get<TSearchProductResult[]>(`${this._search_product_url}/dn`, { params }).pipe(catchErrorAndRethrow())
  private searchResult$ = this.searchProductTerm$.pipe(
    switchMap(t => this.searchProduct(t)),
    getOrElse<TSearchProductResult[]>([])
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

}
