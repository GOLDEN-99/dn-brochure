import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class OiConfigService {

  constructor() { }

  private api = inject(ApiService)

  private discount$ = this.api.get<any[]>(`base/discounts`)

  discount = toSignal(this.discount$, { initialValue: [] })

  // get discountList() {
  //   return this.discount()
  // }

  private lightEvent$ = this.api.get<any[]>(`base/event`)

  lightEvent = toSignal(this.lightEvent$, { initialValue: [] })

  // get lightEventList() {
  //   return this.lightEvent()
  // }

  private notLightEvent$ = this.api.get<any[]>(`base/event`)

  notLightEvent = toSignal(this.notLightEvent$, { initialValue: [] })

  // get notLightEventList() {
  //   return this.notLightEvent()
  // }

  private income$ = this.api.get<any[]>(`base/incomes`)

  income = toSignal(this.income$, { initialValue: [] })

  // get incomeList() {
  //   return this.income()
  // }

}
