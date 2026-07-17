import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { TIncomeItem } from './base-oi';
import { PeriodStatus } from '../../types/other-income';

@Injectable({
  providedIn: 'root'
})
export class PeriodService {

  constructor() { }

  private readonly url = environment.oi
  private readonly api = inject(ApiService)

  createPeriod(id: number, req: TCreatPeriodReq) {
    return this.api.post<{ periodId: number }>(`${this.url}/period/create/${id}`, req)
  }

  insertPo(periodId: number, req: TOrderList[]) {
    return this.api.post<any>(`${this.url}/period/${periodId}/order`, { poList: req })
  }

  insertFreeItem(periodId: number, req: TFreeItemReq) {
    return this.api.post<{ id: number }>(`${this.url}/period/${periodId}/free-item`, req)
  }

  insertBillDiscount(periodId: number, req: TOrderList[]) {
    return this.api.post<any>(`${this.url}/period/${periodId}/bill-discount`, { poList: req })
  }

  deleteFreeItem(periodId: number, freeItemId: number) {
    return this.api.delete(`${this.url}/period/${periodId}/free-item/${freeItemId}`)
  }

  deleteBillDiscount(periodId: number, billDiscountId: number) {
    return this.api.delete(`${this.url}/period/${periodId}/bill-discount/${billDiscountId}`)
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

  // Batch operations
  batchInvoice(req: TPeriodInvBatch[]) {
    return this.api.post<TBatchResult>(`${this.url}/batch/invoice`, req)
  }

  batchReceipt(req: TPeriodReceBatch[]) {
    return this.api.post<TBatchResult>(`${this.url}/batch/receipt`, req)
  }

  batchCredit(req: TPeriodCreditBatch[]) {
    return this.api.post<TBatchResult>(`${this.url}/batch/credit`, req)
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

  updatePeriodStatus(periodId: number, status: PeriodStatus | null) {
    return this.api.patch<{ affectedRows: number }>(
      `${this.url}/period/${periodId}/status`,
      { Status: status }
    )
  }

  deletePeriod(periodId: number) {
    return this.api.delete(`${this.url}/period/${periodId}`)
  }

  matchInvoiceToReceipt(periodId: number, req: TPeriodMatchReq) {
    return this.api.post<unknown>(`${this.url}/period/${periodId}/match`, req)
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

type TFreeItemReq = {
  orderNumb: string
  receNumb: string
  goodCode: string
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

type TPeriodMatchReq = {
  invoiceId: number
  receiptId: number
  matchedAmount: number
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