import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../shared/services/api.service';
import { TOtherIncomeMatching, TPostCreditNoteReq, TPostInvoiceReq, TPostMatchReq, TPostReceiptReq } from '../../shared/types/other-income.type';

@Injectable({
  providedIn: 'root',
})
export class OtherIncomeAccountPeriodService {

  private readonly url = environment.oi
  private readonly api = inject(ApiService)

  insertInv(periodId: number, req: TPostInvoiceReq) {
    return this.api.post<any>(`${this.url}/period/${periodId}/invoice`, req)
  }

  insertRece(periodId: number, req: any) {
    throw new Error('fix type here')
    return this.api.post<any>(`${this.url}/period/${periodId}/receipt`, req)
  }

  insertCredit(periodId: number, req: TPostCreditNoteReq) {
    return this.api.post<any>(`${this.url}/period/${periodId}/credit`, req)
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

  deletePeriod(periodId: number) {
    return this.api.delete(`${this.url}/period/${periodId}`)
  }

  matchInvoiceToReceipt(periodId: number, req: TPostMatchReq) {
    return this.api.post<unknown>(`${this.url}/period/${periodId}/match`, req)
  }
}

