import { computed, inject, Injectable, signal } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { TCommonIncome } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class OtherIncomeFormService {

  constructor() { }

  private calander = inject(NgbCalendar)

  state = signal<TCommonIncome>({
    event: 0,
    compCode: '',
    compName: '',
    cn: '',
    period: 0,
    incVat: false,
    target: 0,
    percent: 0,
    step: [],
    limit: false,
    limitAmount: 0,
    fromDate: this.calander.getToday(),
    toDate: this.calander.getToday(),
    discount: false,
    discountType: 0,
    productList: []
  })

  updator = <K extends keyof TCommonIncome>(key: K) => (value: TCommonIncome[K]) => this.state.update(prev => ({ ...prev, [key]: value }))

  updateMany = (values: Partial<TCommonIncome>) => this.state.update(prev => ({ ...prev, ...values }))

  notSelectComp = computed(() => {
    const { compCode, compName } = this.state()
    return compCode.trim() === '' || compName.trim() === ''
  })
}
