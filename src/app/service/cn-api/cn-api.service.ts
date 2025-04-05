import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TMaybe } from '../../types';
import { TCNQueryParams, TCreateReq, TWholeItem } from '../../types/cn.type';
import { catchError, Subject, switchMap, tap, throwError } from 'rxjs';
import { CnOrderService } from '../cn-order/cn-order.service';

@Injectable({
  providedIn: 'root'
})
export class CnApiService {

  constructor() { }

  private api = inject(ApiService)
  private orderServ = inject(CnOrderService)
  private url = "https://sandbox.dn.drugnetcenter.com/ReturnRequest"
  wholeItemData = signal<TMaybe<TWholeItem>>(null)

  private params$ = new Subject<TCNQueryParams>()

  paramsSignal = signal<TMaybe<TCNQueryParams>>(null)

  getWholeItem = ({ wholeCode, saleCode, wholeNumb }: TCNQueryParams) => {
    this.paramsSignal.update(() => ({ wholeCode, wholeNumb, saleCode }))
    return this.api.get<TWholeItem>(`${this.url}/GetWhole`, {
      params: {
        SaleCode: saleCode, WholeCode: wholeCode, WholeNumb: wholeNumb
      }
    }).pipe(tap(() => this.orderServ.fetch(wholeNumb)), tap(res => this.wholeItemData.update(() => res)))
  }

  search(q: TCNQueryParams) {
    this.params$.next(q)
  }

  submit = (req: TCreateReq) => this.api.post(`${this.url}/CreateWholeRequest`, req)
}
