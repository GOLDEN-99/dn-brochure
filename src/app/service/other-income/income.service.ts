import { inject, Injectable, OnDestroy } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { catchError, of, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor() { }
  private incomeMap = new Map<number, Pick<TIncome, 'incomeName' | 'isProduct'>>()
  private api = inject(ApiService)
  private url = environment.oi
  private income$ = this.api.get<TIncome[]>(`${this.url}/other-income/income`)
    .pipe(
      tap((value) => {
        value.forEach(({ id, incomeName, isProduct }) => {
          this.incomeMap.set(id, { incomeName, isProduct })
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
  isProduct: number
}