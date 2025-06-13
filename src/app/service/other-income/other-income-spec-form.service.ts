import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { TSpecialIncome } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class OtherIncomeSpecFormService {

  private api = inject(ApiService)

  private url = ``

  calendar = inject(NgbCalendar);

  state = signal<TSpecialIncome>({
    target: 0,
    period: 0,
    incVat: false,
    targetAmount: 0,
    event: 0,
    fromDate: this.calendar.getToday(),
    toDate: this.calendar.getToday(),
    discount: false,
    discountType: 1
  })

  updator = <K extends keyof TSpecialIncome>(key: K) =>
    (value: TSpecialIncome[K]) => this.state.update(prev => ({ ...prev, [key]: value }))
}
