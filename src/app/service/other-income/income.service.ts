import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { catchError, of, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor() { }
  private readonly incomeMap = new Map<number, Pick<TIncome, 'incomeName' | 'incomeType'>>()
  private readonly api = inject(ApiService)
  private readonly url = environment.oi
  private readonly income$ = this.api.get<TIncome[]>(`${this.url}/other-income/income`)
    .pipe(
      tap((value) => {
        value.forEach(({ id, incomeName, incomeType }) => {
          this.incomeMap.set(id, { incomeName, incomeType })
        })
      }),
      catchError(err => { console.log(err); return of([]) })
    )
  income = toSignal(this.income$, { initialValue: [] })
  getValue = (id: number) => {
    const value = this.incomeMap.get(id)
    if (!value) throw new Error('invalid id')
    return value
  }
}

export type TIncome = {
  id: number
  incomeName: string
  incomeType: number
}