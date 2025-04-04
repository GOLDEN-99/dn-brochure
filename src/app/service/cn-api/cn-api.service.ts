import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TMaybe } from '../../types';
import { TCNQueryParams, TWholeItem } from '../../types/cn.type';
import { catchError, Subject, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CnApiService {

  constructor() {
    this.params$.pipe(switchMap(this.getWholeItem), catchError((err) => throwError(() => err))).subscribe({
      next: (item) => this.wholeItemData.update(() => item)
    })
  }

  private api = inject(ApiService)
  private url = "https://api.drugnetcenter.com/ReturnRequest"
  wholeItemData = signal<TMaybe<TWholeItem>>(null)

  private params$ = new Subject<TCNQueryParams>()

  private getWholeItem = ({ wholeCode, saleCode, wholeNumb }: TCNQueryParams) => this.api.get<TWholeItem>(`${this.url}/WholeCode`, {
    params: {
      SaleCode: saleCode, WholeCode: wholeCode, WholeNumb: wholeNumb
    }
  })

  search(q: TCNQueryParams) {
    this.params$.next(q)
  }
}
