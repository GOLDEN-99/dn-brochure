import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { TOtherIncomeCompany } from '../../shared/types/other-income.type';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class OtherIncomeSearchCompService {
  private readonly api = inject(ApiService)
  private readonly url = `${environment.oi}/other-income/comp`

  dnCompName = signal('')
  private readonly dnCompName$ = toObservable(this.dnCompName)
  dnCompReuslt$ = this.dnCompName$.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    switchMap((compName) => this.searchDNComp(compName)),
    map(prev => [...prev].slice(0, 5))
  )
  dnCompResult = toSignal(this.dnCompReuslt$, { initialValue: [] })

  huCompName = signal('')
  private readonly huCompName$ = toObservable(this.huCompName)
  huCompReuslt$ = this.huCompName$.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    switchMap((compName) => this.searchHUComp(compName)),
    map(prev => [...prev].slice(0, 5))
  )
  huCompResult = toSignal(this.huCompReuslt$, { initialValue: [] })

  private readonly searchDNComp = (name: string) => this.api.get<TOtherIncomeCompany[]>(
    `${this.url}/DN`, { params: { name } })
    .pipe(catchError(err => { console.log(err); return of([] as TOtherIncomeCompany[]) }))



  private readonly searchHUComp = (name: string) => this.api.get<TOtherIncomeCompany[]>(
    `${this.url}/HU`, { params: { name } })
    .pipe(catchError(err => { console.log(err); return of([] as TOtherIncomeCompany[]) }))

}


type TSearchCompParams = { name?: string, compCode?: string }