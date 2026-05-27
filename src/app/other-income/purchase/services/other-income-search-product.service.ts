import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap } from 'rxjs';
import { COMP_TYPE, TOtherIncomeCompType } from '../../shared/types/other-income.type';

@Injectable()
export class OtherIncomeSearchProductService {

  private readonly api = inject(ApiService)
  private readonly url = `${environment.oi}/other-income/product`

  dnCompCode = signal('')
  private readonly dnCompCode$ = toObservable(this.dnCompCode)
  searchDNProduct = (compCode: string) => this.api.get<TSearchProductResult[]>(`${this.url}/DN`, { params: { compCode } })
  private readonly dnProductResult$ = this.dnCompCode$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(term => term !== ''),
    switchMap((compCode) => this.searchDNProduct(compCode)),
    catchError(err => of([] as TSearchProductResult[]))
  )
  dnProductResult = toSignal(this.dnProductResult$, { initialValue: [] })

  huCompCode = signal('')
  searchProduct({ compCode, compType }: TSearchProduct) {
    return this.api
      .get<TSearchProductResult[]>(
        `${this.url}/${COMP_TYPE[compType]}`,
        { params: { compCode } }
      ).pipe(catchError(err => of([] as TSearchProductResult[])))
  }
  private readonly huCompCode$ = toObservable(this.huCompCode)
  searchHUProduct = (compCode: string) => this.api.get<TSearchProductResult[]>(`${this.url}/HU`, { params: { compCode } })
  private readonly huProductResult$ = this.huCompCode$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(term => term !== ''),
    switchMap((compCode) => this.searchHUProduct(compCode)),
    catchError(err => of([] as TSearchProductResult[]))
  )
  huProductResult = toSignal(this.huProductResult$, { initialValue: [] })

}

export type TSearchProductResult = {
  goodCode: string
  goodName: string
  barCode: string
}

type TSearchProduct = {
  compType: TOtherIncomeCompType
  compCode: string
}
