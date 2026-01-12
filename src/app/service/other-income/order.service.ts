import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, distinctUntilChanged, filter, Observable, of, shareReplay, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor() { }

  private api = inject(ApiService)
  private url = environment.oi
  private billUrl = `${this.url}/po/bill`
  private goodUrl = `${this.url}/po/good`

  private params$ = new Subject<TOnSearchParams>()
  private shared$ = this.params$.pipe(shareReplay(1))
  private search({ compCode, compType, discType, ...res }: TOnSearchParams): Observable<TOiBill[]> {
    const currentUrl = `${this.billUrl}/${compType}/${compCode}/${discType}`
    return this.api.get<TOiBill[]>(currentUrl, { params: { ...res } })
      .pipe(catchError(err => of([])))
  }
  private searchGood({ compCode, compType, discType, ...res }: TOnSearchParams): Observable<TOiGood[]> {
    const currentUrl = `${this.goodUrl}/${compType}/${compCode}/${discType}`

    return this.api.get<TOiGood[]>(currentUrl, { params: { ...res } })
      .pipe(catchError(err => of([])))
  }
  // ท้ายบิล
  private poList$ = this.shared$.pipe(switchMap(p => this.search(p)))
  billDiscount = toSignal(this.poList$, { initialValue: [] })
  // สินค้า
  private goodOrderList$ = this.shared$.pipe(switchMap(p => this.searchGood(p)))
  goodDiscount = toSignal(this.goodOrderList$, { initialValue: [] })
  onSerach = (req: TOnSearchParams) => {
    this.params$.next(req);
  }
}

type TSmallRece = {
  receNumb: string
  discount: number
}

type TSmallProduct = {
  goodCode: string
  goodName: string
  barCode: string
  receNumb: string
  discount: number
}

export type TOiOrder = {
  remark: string
  orderNumb: string
  discount: number
}

export type TOiBill = {
  receList: TSmallRece[]
  receDate: string
  billDate: string
  billNumb: string
} & TOiOrder

export type TOiGood = {
  productList: TSmallProduct[]
  receDate: string
  billDate: string
  billNumb: string
  remark: string
} & TOiOrder


type TOnSearchParams = {
  compCode: string,
  compType: string,
  discType: number,
  order: string;
  receStart?: string;
  receEnd?: string;
  billStart?: string;
  billEnd?: string;
}