import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { TOtherIncomeCompanyRes } from '../../shared/types/other-income.type';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class OtherIncomeSearchCompService {
  constructor() {
    console.log('creating ...')
  }
  private readonly api = inject(ApiService)
  private readonly url = `${environment.oi}/v2/master/suppliers`

  dnCompName = signal('')
  private readonly dnCompName$ = toObservable(this.dnCompName)
  dnCompReuslt$ = this.dnCompName$.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    switchMap((compName) => this.searchComp('DN', compName)),
    map(prev => [...prev].slice(0, 5))
  )
  dnCompResult = toSignal(this.dnCompReuslt$, { initialValue: [] })

  huCompName = signal('')
  private readonly huCompName$ = toObservable(this.huCompName)
  huCompReuslt$ = this.huCompName$.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    switchMap((compName) => this.searchComp('HU', compName)),
    map(prev => [...prev].slice(0, 5))
  )
  huCompResult = toSignal(this.huCompReuslt$, { initialValue: [] })

  searchComp = (compType: 'DN' | 'HU', compName: string) =>
    this.api.get<TOtherIncomeCompanyRes[]>(this.url, { params: { compType, compName } })
      .pipe(
        map(res => res.map(r => ({ ...r, compType }) satisfies TOtherIncomeCompanyRes)),
        catchError(err => { console.log(err); return of([] as TOtherIncomeCompanyRes[]) })
      )
}
