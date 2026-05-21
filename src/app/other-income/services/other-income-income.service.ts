import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../service/api/api.service';
import { environment } from '../../../environments/environment';
import { TOtherIncomeIncome } from '../types/other-income.type';
import { getOrElse } from '../../shared/libs/rxjs-custom-operator';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class OtherIncomeIncomeService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi
  private readonly income$ = this.api
                              .get<TOtherIncomeIncome[]>(`${this.url}/other-income/income`)
                              .pipe<TOtherIncomeIncome[]>(getOrElse([]))
  income = toSignal(this.income$, { initialValue: [] })

}
