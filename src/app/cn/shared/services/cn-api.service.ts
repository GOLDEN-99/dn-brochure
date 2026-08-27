import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { CnLoadError, TCreateReq, TGoodItemBase, TGoodItemState, TLotItem, TOrderRes, TRemark, TWholeItem } from '../types/cn.type';
import { catchError, combineLatest, map, of, shareReplay, throwError } from 'rxjs';
import { TCNRouteParam } from '../libs/parse-cn-param';
import { HttpErrorResponse } from '@angular/common/http';
import { wholeItemResponseSchema } from '../libs/cn-response-schema';
import { ZodError } from 'zod';
@Injectable({
  providedIn: 'root',
})
export class CnApiService {
  private readonly api = inject(ApiService)

  private readonly url = environment.cnPath
  getOrder = (req: TCNRouteParam) =>
    this.api
      .get<TOrderRes>(`${this.url}/GetOrder`, { params: { WholeNumb: req.wholeNumb } })
      .pipe(
        catchError(err => throwError(() => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 418) return new CnLoadError('order-not-found', 'ไม่พบใบสั่งซื้อ หรือถูก CN ไปแล้ว', req)
            return new CnLoadError('api-error', `[${err.status}] ${err.message}`, req)
          }
          return err
        }))
      )

  getWholeItem = (req: TCNRouteParam) =>
    this.api.get<TWholeItem>(`${this.url}/GetWhole`, {
      params: {
        SaleCode: req.saleCode, WholeCode: req.wholeCode, WholeNumb: req.wholeNumb
      }
    }).pipe(
      map(res => wholeItemResponseSchema.parse(res)),
      catchError(err => throwError(() => {
        if (err instanceof ZodError) {
          return new CnLoadError('whole-item-not-found', 'ไม่พบข้อมูลร้านค้า/ใบขาย/sale', req)
        }
        return err
      }))
    )

  getData = (req: TCNRouteParam) =>
    combineLatest([this.getWholeItem(req), this.getOrder(req)])
      .pipe(
        map(([wholeItem, order]) => ({ ...wholeItem, ...order, isWRR: req.isWRR, saleCode: req.saleCode, returnAmount: order.goodList.reduce((acc, cur) => acc + cur.useItem, 0) })),
        catchError((err) => throwError(() => err))
      )

  // reference data ที่ไม่เปลี่ยนระหว่าง session และมีสอง select ที่ใช้ร่วมกัน
  // (หมวดสาเหตุ + สาเหตุ) จึง cache ไว้ ไม่ให้ยิงซ้ำทุกครั้งที่กลับมาหน้าแรก
  private readonly remark$ = this.api
    .get<TRemark[]>(`${this.url}/GetCNRemark`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }))

  getRemark = () => this.remark$



  searchProductByBarcode = (term: string) => this.api.get<TSearchResult>(`${this.url}/GetBarCode/${term}`)
    .pipe(
      map<TSearchResult, Array<TGoodItemState>>(({ goodCode, goodAmou, goodName, barCode, unitCode, unitDesc, unitPrice, useItem }) => [{
        goodCode, goodName, barCode, unitCode, unitDesc, unitPrice, goodAmou, useItem,
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
  check: boolean
  lot: Array<Omit<TLotItem, 'goodAmou'> & { check: boolean }>
} & Omit<TGoodItemBase, 'lot'>
