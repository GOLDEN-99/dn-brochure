import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TInsertMonthlyIncome } from '../../types';
import { BaseOiService } from './base-oi';
import { environment } from '../../../environments/environment';
import { TEvent } from './event.service';
import { TOIComp } from './company.service';
import { TDiscount } from './discount.service';
import { TIncome } from './income.service';

@Injectable({
  providedIn: 'root'
})
export class OiNotLightService extends BaseOiService {

  constructor() {
    super()
    this.getAll({}).subscribe({
      next: (data) => this.notLightList.update(prev => data)
    })
  }

  private url = environment.oi

  getAll(query: {}) {
    return this.api.get<NotLightSummary[]>(`${this.url}/other-income/contact/not-light`, { params: query })
  }

  notLightList = signal<NotLightSummary[]>([])

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

type NotLightSummary = {
  id: number
  notLightId: number,
  displayName: string,
  period: number,
  startDate: string,
  endDate: string,
  isStep: false,
  capAmount: number | null,
  incVat: boolean,
  cn: string,
  company: TOIComp
  event: TEvent,
  discount: TDiscount
  income: TIncome
}