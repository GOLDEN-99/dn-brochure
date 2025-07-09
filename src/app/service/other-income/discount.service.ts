import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {

  constructor() { }

  private api = inject(ApiService)
  private url = environment.oi
  private discount$ = this.api
    .get<TDiscount[]>(`${this.url}/other-income/discount`)
    .pipe(
      map((data => data.filter(({ id }) => id !== 1))),
      catchError(err => { console.log(err); return of([]) })
    )
  discount = toSignal(this.discount$, { initialValue: [] })
}

type TDiscount = {
  id: number
  discountName: string
}