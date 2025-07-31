import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';

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
}

type TCreatPeriodReq = {
  remark: string
  totalAmount: number
  totalIncome: number
  monthlyList: number[]
}

type TOrderList = {
  orderNumb: string
  actualAmount: number
}

type TPeriodInvReq = {
  invNumb: string
  invDate: string
  invAmount: number
  exIncome: number
  withholding: number
}

type TPeriodReceReq = {
  receNumb: string
  receDate: string
  receAmount: number
  receRemark: string
}