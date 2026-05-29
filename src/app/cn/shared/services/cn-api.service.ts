import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { TAppGoodItem, TAppLot, TCreateReq, TGoodItemState, TOrderRes, TWholeItem } from '../types/cn.type';
import { catchError, combineLatest, filter, map, of, Subject, switchMap, throwError } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TCNRouteParam } from '../libs/parse-cn-param';
import { mapGoodItemToState } from '../libs/goodItem-goodState';

@Injectable({
  providedIn: 'root',
})
export class CnApiService {
  private readonly api = inject(ApiService)

  private readonly url = environment.cnPath
  getOrder = ({ wholeNumb }: Pick<TCNRouteParam, 'wholeNumb'>) =>
    this.api.get<TOrderRes>(`${this.url}/GetOrder`, { params: { WholeNumb: wholeNumb } })
      .pipe(map(({ goodList, ...res }) => ({ ...res, goodList: goodList.map(good => mapGoodItemToState(good)) })))



  getWholeItem = ({ wholeCode, saleCode, wholeNumb }: Omit<TCNRouteParam, 'isWRR'>) =>
    this.api.get<TWholeItem>(`${this.url}/GetWhole`, {
      params: {
        SaleCode: saleCode, WholeCode: wholeCode, WholeNumb: wholeNumb
      }
    })

  getData = ({ isWRR, ...res }: TCNRouteParam) => combineLatest([this.getWholeItem(res), this.getOrder(res)])
    .pipe(
      map(([wholeItem, order]) => ({ ...wholeItem, ...order, isWRR, saleCode: res.saleCode, returnAmount: order.goodList.reduce((acc, cur) => acc + cur.useItem, 0) })),
      catchError((err) => throwError(() => err))
    )



  searchProductByBarcode = (term: string) => this.api.get<TSearchResult>(`${this.url}/GetBarCode/${term}`)
    .pipe(
      map<TSearchResult, Array<TGoodItemState>>(({ goodCode, goodName, barCode, unitCode, unitDesc, unitPrice, useItem }) => [{
        goodCode, goodName, barCode, unitCode, unitDesc, unitPrice, useItem,
        orderAmount: 0, subTotal: 0
      }]),
      catchError(
        err => {
          console.log(err);
          return of([])
        })
    )

  submit = (req: TCreateReq) => this.api.post(`${this.url}/CreateWholeRequest`, req)
}

type TSearchResult = {
  lot: Array<Omit<TAppLot, 'goodAmou' | 'returnAmou'>>
} & Omit<TAppGoodItem, 'lot'>
