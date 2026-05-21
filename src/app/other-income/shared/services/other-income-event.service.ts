import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { TOtherIncomeEvent } from '../types/other-income.type';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class OtherIncomeEventService {

  private readonly api = inject(ApiService)
  private readonly url = environment.oi
  private readonly event$ = this.api
    .get<TOtherIncomeEvent[]>(`${this.url}/other-income/event`)
    .pipe(catchError((err) => of<TOtherIncomeEvent[]>([])))
  event = toSignal(this.event$, { initialValue: [] })
}
