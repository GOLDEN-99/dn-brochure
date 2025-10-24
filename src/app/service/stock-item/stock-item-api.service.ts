import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, map, Observable, of, retry, retryWhen, startWith, Subject, switchMap, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { catchErrorAndRethrow, getOrElse } from '../../lib/utli';
import { TMaybe, TStockSetup } from '../../types';


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
    getOrElse<TBaseProduct[]>([]),
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
    return this.api.get<TGPResponse>(`${this._stock_item_url}/good/${goodCode}`)
      .pipe(
        map(raw => this._formatCost(raw)),
        getOrElse(null),
        startWith(null)
      )
  }

  getHistSale = (goodCode: string) => {
    return this.api.get<TDNSaleResponse>(`${this._stock_item_url}/sale/${goodCode}`)
      .pipe(
        map<TDNSaleResponse, TDNSaleResponse>(({ short, long, ...res }) => {
          const praseShort = { totalMean: this._formatNumber(short.totalMean), countMean: this._formatNumber(short.countMean) }
          const praseLong = { totalMean: this._formatNumber(long.totalMean), countMean: this._formatNumber(long.countMean) }
          return { short: praseShort, long: praseLong, ...res }
        }),
        getOrElse(null),
        startWith(null)
      )
  }

  getHUSaleCount = (goodCode: string) => {
    return this.api.get<THUSaleResponse>(`${this._stock_item_url}/hu-item-count/${goodCode}`)
      .pipe(
        map<THUSaleResponse, TAppFormatList<Omit<THistSaleRecordBase, 'subtotal'>>>(({ short, long, countList }) => {
          const praseShort = this._formatNumber(short.countMean)
          const praseLong = this._formatNumber(long.countMean)
          return { short: praseShort, long: praseLong, list: countList }
        }),
        getOrElse(null),
        startWith(null)
      )
  }

  getManyStock = (params: TQueryManyStockRequest): Observable<Array<TQueryNewStockResponse>> =>
    this.api.get<Array<TQueryNewStockResponse>>(`${this._stock_item_url}`, { params })
      .pipe(
        startWith([])
      )

  updateNewStock = ({ id, ...res }: TUpdateStockRequest) => this.api.post(`${this._stock_item_url}/${id}`, { ...res })

  private _formatCost = ({ goodCode, dnCost, priceW3 }: TGPResponse) => {
    const praseCost = this._formatNumber(dnCost)
    const prasePrice = this._formatNumber(priceW3)
    return { goodCode, dnCost: praseCost, priceW3: prasePrice }
  }

  private _formatNumber = (value: number) => Number(value.toFixed(2))
}


export type TBaseProduct = {
  goodCode: string
  goodName: string
  barCode: string
  goodStat: boolean
}

export type TGPResponse = {
  goodCode: string
  dnCost: number
  priceW3: number
}

export type THistSaleRecordBase = {
  monthIndex: number
  subtotal: number
  itemCount: number
}


export type TDNSummaryBase = {
  totalMean: number
  countMean: number
}

export type TDNSaleResponse = {
  short: TDNSummaryBase
  long: TDNSummaryBase
  saleList: Omit<THistSaleRecordBase, 'itemCount'>[]
  countList: Omit<THistSaleRecordBase, 'subtotal'>[]
}

export type THUSaleResponse = {
  short: Pick<TDNSummaryBase, 'countMean'>
  long: Pick<TDNSummaryBase, 'countMean'>
  countList: Omit<THistSaleRecordBase, 'subtotal'>[]
}

export type TAppFormatList<T> = {
  short: number
  long: number
  list: T[]
}

export type TStockState = {
  goodCode: string
  priceW3: number
  oldCost: number
  newCost: number
  riskPercent: number
  saleMean: number // month from criteria
  rawMonth: number // rawMonth || rawMonth/2
  useMonth: number
  dnSale: number
  huSale: number
  dnUpsalePercent: number
  huUpsalePercent: number
  actualStock: number
  // computed for display
  dnExpectCount: number
  huExpectCount: number
  totalCount: number
  expectTotalCount: number
  stockCount: number
  expectStockCount: number
}

type TCreateNewStock = Pick<TStockState, 'goodCode' | 'oldCost' | 'newCost' | 'priceW3' | 'riskPercent' | 'dnSale' | 'huSale' | 'dnUpsalePercent' | 'huUpsalePercent' | 'actualStock'>

export type TQueryManyStockRequest = {
  barCode: string
  duration: number
}

export type TQueryNewStockResponse = {
  id: number
  goodName: string
  barCode: string
  unitDesc: string
  createAt: string
  updateAt: TMaybe<string>
} & TCreateNewStock

export type TUpdateStockRequest = Pick<TQueryNewStockResponse, 'id'>