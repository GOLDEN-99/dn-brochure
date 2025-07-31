import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor() { }

  private api = inject(ApiService)

  private url = '.../invoices'

  getInvoiceByTerm(purchasingId: number) {
    return this.api.get(`${this.url}/purchasing/${purchasingId}/invoices`)
  }

  createInvoice(purchasingId: number, invoice: {}) {
    return this.api.post(`${this.url}/purchasing/${purchasingId}/invoices`, invoice)
  }

  getInvById(invId: number) {
    return this.api.get(`${this.url}/invoices/${invId}`)
  }

  editInvoice(invId: number, newInv: {}) {
    this.api.post(`${this.url}/invoices/${invId}`, newInv)
  }
}
