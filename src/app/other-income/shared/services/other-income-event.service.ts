import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { TContractLabel } from '../types/other-income.type';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class OtherIncomeEventService {

  private readonly api = inject(ApiService)
  private readonly url = environment.oi
  private readonly event$ = this.api
    .get<TContractLabel[]>(`${this.url}/v2/master/events`)
    .pipe(catchError((err) => of<TContractLabel[]>([])))
  event = toSignal(this.event$, { initialValue: [] })
}
