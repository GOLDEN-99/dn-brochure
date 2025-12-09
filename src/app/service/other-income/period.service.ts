import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { TIncomeItem } from './base-oi';

@Injectable({
  providedIn: 'root'
})
export class PeriodService {

  constructor() { }

  private url = environment.oi
  private api = inject(ApiService)

  createPeriod(id: number, req: TCreatPeriodReq) {
    return this.api.post<{ periodId: number }>(`${this.url}/period/create/${id}`, req)
  }

  insertPo(periodId: number, req: TOrderList[]) {
    return this.api.post<any>(`${this.url}/period/${periodId}/order`, { poList: req })
  }

  insertInv(periodId: number, req: TPeriodInvReq) {
    return this.api.post<any>(`${this.url}/period/${periodId}/invoice`, req)
  }

  insertRece(periodId: number, req: TPeriodReceReq) {
    return this.api.post<any>(`${this.url}/period/${periodId}/receipt`, req)
  }

  insertCredit(periodId: number, req: TPeriodCreditReq) {
    return this.api.post<any>(`${this.url}/period/${periodId}/credit`, req)
  }
}

type TMonth = Pick<TIncomeItem, 'startDate' | 'endDate' | 'id'>

type TCreatPeriodReq = {
  periodName: string
  totalAmount: number
  totalIncome: number
  periodRemark: string
  monthlyList: TMonth[]
}

type TOrderList = {
  orderNumb: string
  receNumb: string
  actualAmount: number
  remark: string
}

type TPeriodInvReq = {
  invNumb: string
  invDate: string
  invAmount: number
  invRemark: string
}

type TPeriodReceReq = {
  receNumb: string
  receDate: string
  receAmount: number
  receRemark: string
}

type TPeriodCreditReq = {
  creditNumb: string
  creditDate: string
  creditAmount: number
  creditRemark: string
}