import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../shared/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class OtherIncomePurchasePeriodService {

  private readonly url = environment.oi
  private readonly api = inject(ApiService)

  createPeriod(id: number, req: TCreatPeriodReq) {
    return this.api.post<{ periodId: number }>(`${this.url}/period/create/${id}`, req)
  }

  insertPo(periodId: number, req: TOrderList[]) {
    return this.api.post<any>(`${this.url}/period/${periodId}/order`, { poList: req })
  }

  insertFreeItem(periodId: number, req: TOrderList[]) {
    return this.api.post<any>(`${this.url}/period/${periodId}/free-item`, { poList: req })
  }

  deleteFreeItem(periodId: number, freeItemId: number) {
    return this.api.delete(`${this.url}/period/${periodId}/free-item/${freeItemId}`)
  }

  deleteBillDiscount(periodId: number, billDiscountId: number) {
    return this.api.delete(`${this.url}/period/${periodId}/bill-discount/${billDiscountId}`)
  }

  deleteReceipt(periodId: number, receiptId: number) {
    return this.api.delete(`${this.url}/period/${periodId}/receipt/${receiptId}`)
  }

  deleteInvoice(periodId: number, invoiceId: number) {
    return this.api.delete(`${this.url}/period/${periodId}/invoice/${invoiceId}`)
  }

  deleteCreditNote(periodId: number, creditNoteId: number) {
    return this.api.delete(`${this.url}/period/${periodId}/credit/${creditNoteId}`)
  }

}

type TMonth = { startDate: string, endDate: string, id: number }

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

export type TPeriodInvBatch = { periodId: number } & TPeriodInvReq

export type TPeriodCreditBatch = { periodId: number } & TPeriodCreditReq

export type TPeriodReceBatch = { periodId: number } & TPeriodReceReq

export type TBatchError = {
  rowNumber: number
  periodId: number
  message: string
}

export type TBatchResult = {
  updated: number
  created: number
  skipped: number
  failed: number
  errors: TBatchError[]
}
