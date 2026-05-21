import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { TOtherIncomeIncome } from '../types/other-income.type';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OtherIncomeIncomeService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi
  private readonly income$ = this.api
    .get<TOtherIncomeIncome[]>(`${this.url}/other-income/income`)
    .pipe(catchError(() => of<TOtherIncomeIncome[]>([])))
  income = toSignal(this.income$, { initialValue: [] })

}
