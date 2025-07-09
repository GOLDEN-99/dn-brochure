import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TInsertMonthlyIncome } from '../../types';
import { BaseOiService } from './base-oi';

@Injectable({
  providedIn: 'root'
})
export class OiNotLightService extends BaseOiService {

  private url = ''

  getAll(query: {}) {
    return this.api.get(`${this.url}`, { params: query })
  }

  getById(id: number) {
    return this.api.get(`${this.url}/${id}`)
  }

  create(req: {}) {
    return this.api.post(this.url, req)
  }

  update(id: number, body: {}) {
    return this.api.post(`${this.url}/${id}`, body)
  }

  addIncome(id: number, req: TInsertMonthlyIncome) {
    return this.api.post(`${this.url}/${id}/incomes`, req)
  }

  getTerm(id: number) {
    return this.api.get(`${this.url}/${id}/terms`)
  }

  createPo(id: number, purchasingId: number, poList: {}) {
    return this.api.post(`${this.url}/${id}/${purchasingId}`, poList)
  }

}
