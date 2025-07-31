import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor() { }

  private api = inject(ApiService)

  private url = '.../receipt'

  getReceiptByTerm(purchasingId: number) {
    return this.api.get(`${this.url}/purchasing/${purchasingId}/receipts`)
  }

  createReceipt(purchasingId: number, receipt: {}) {
    return this.api.post(`${this.url}/purchasing/${purchasingId}/receipts`, receipt)
  }

  getById(receId: number) {
    return this.api.get(`${this.url}/receipts/${receId}`)
  }

  editRecipt(receId: number, newRece: {}) {
    return this.api.post(`${this.url}/receipts/${receId}`, newRece)
  }
}
