import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, Subject, switchMap, tap, throwError } from 'rxjs';
import { CnOrderService } from '../cn-order/cn-order.service';
import { ApiService } from '../../api/api.service';
import { TMaybe } from '../../../types';
import { TCNQueryParams, TCnType, TCreateReq, TPrepenCnApi, TReamrk, TWholeItem } from '../../../types/cn.type';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CnApiService {

  private api = inject(ApiService)
  private orderServ = inject(CnOrderService)
  private url = environment.cnPath
  wholeItemData = signal<TMaybe<TWholeItem>>(null)

  private params$ = new Subject<TCNQueryParams>()

  paramsSignal = signal<TMaybe<TCNQueryParams>>(null)

  isWRR = signal('')

  getWholeItem = ({ wholeCode, saleCode, wholeNumb, isWRR }: TCNQueryParams & { isWRR: string }) => {
    this.paramsSignal.update(() => ({ wholeCode, wholeNumb, saleCode }))
    console.log('set wrr side effect ', isWRR)
    this.isWRR.set(isWRR === '0' ? '' : isWRR)
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

  remark = signal<string>("")
  cusStat = signal<TCustStat>({ id: '0', stat: 'ไม่โอนคืน' })
  showBank = computed(() => this.cusStat().id === '1')

  setRemark = (value: string) => this.remark.set(value)

  prependReq = computed(() => {
    const query = this.paramsSignal()
    if (!query) throw new Error('no default data')
    const whole = this.wholeItemData()
    if (!whole) throw new Error('no default data')
    const { bankAcName, bankNumb, bankCode } = whole
    const cusStat = this.cusStat().id
    return {
      bankAcName,
      bankNumb,
      bankcode: bankCode,
      remark: this.remark(),
      cusStat,
      ...query,
    } satisfies TPrepenCnApi
  })

}

type TEditableState = {
  remark: string,
  cnType: TCnType
  remarkOpt: TReamrk
}

type TCustStat = { id: string, stat: string }


