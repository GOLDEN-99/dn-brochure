import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';

@Injectable()
export class OtherIncomeSearchOrderService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  searchOrder(contractId: number, orderNumb: string): Observable<TSearchOrderResult[]> {
    return this.api.get(`${this.url}/v2/order-contracts/${contractId}/orders`, { params: { orderNumb } })
  }
}

export type TSearchOrderResult = {
  orderNumb: string
  allTotal: number
  vat: number
  includeVat: boolean
}
