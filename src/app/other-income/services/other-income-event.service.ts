import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../service/api/api.service';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { getOrElse } from '../../shared/libs/rxjs-custom-operator';
import { TOtherIncomeEvent } from '../types/other-income.type';

@Injectable({
  providedIn: 'root',
})
export class OtherIncomeEventService {
  
  private readonly api = inject(ApiService)
  private readonly url = environment.oi
  private readonly event$ = this.api.get<TOtherIncomeEvent[]>(`${this.url}/other-income/event`).pipe<TOtherIncomeEvent[]>(getOrElse([]))
  event = toSignal(this.event$, { initialValue: [] })
}
