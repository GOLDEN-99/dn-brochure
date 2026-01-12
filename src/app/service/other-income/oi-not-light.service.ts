import { inject, Injectable, Signal, signal } from '@angular/core';
import { TInsertMonthlyIncome, TOIStepItem } from '../../types';
import { BaseOiService, ManyContactResponse, NotLightSingle, NotLightSummary } from './base-oi';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, shareReplay, Subject, switchMap, tap } from 'rxjs';

interface IRefetchable {
  refetch: () => void
}
interface IOiHead {
  singleRecord: Signal<any[]>
}
@Injectable({
  providedIn: 'root'
})
export class OiNotLightService extends BaseOiService implements IRefetchable, IOiHead {

  getAll({ compType, query }: { compType: string, query: {} }): Observable<ManyContactResponse[]> {
    return this.api.get<ManyContactResponse[]>(`${this.url}/other-income/contact/not-light/${compType}`, { params: query })
      .pipe(catchError(err => of([])))
  }

  private queryParam$ = new Subject<TSearchManyHead>()

  private notLight$ = this.queryParam$.pipe(
    switchMap(({ compType, ...res }) => this.getAll({ compType, query: res }))
  )
  searchMany(req: TSearchManyHead) {
    this.queryParam$.next(req)
  }

  notLightList = toSignal(this.notLight$, { initialValue: [] })

  getById(id: number, compType: string) {
    return this.api.get<NotLightSingle[]>(`${this.url}/other-income/contact/not-light/${compType}/${id}`)
      .pipe(catchError(err => {
        console.log(err);
        return of([]);
      }
      ))

  }

  private fetch$ = new BehaviorSubject<boolean>(true)
  refetch = () => this.fetch$.next(true)
  private id$ = new Subject<number>()
  private comp2$ = new Subject<string>()
  private param$ = combineLatest([this.fetch$, this.id$, this.comp2$])
  fetchById(id: number, compType: string) {
    this.id$.next(id)
    this.comp2$.next(compType)
  }

  private singleRecord$ = this.param$
    .pipe(
      switchMap(([_, id, compType]) => this.getById(id, compType)),
    )
  singleRecord = toSignal(this.singleRecord$, { initialValue: [] })
  create(req: {}) {
    return this.api.post(this.url, req)
  }

  update(id: number, body: {}) {
    return this.api.post(`${this.url}/${id}`, body)
  }

  addIncome(id: number, req: TInsertMonthlyIncome) {
    return this.api.post(`${this.url}/${id}/incomes`, req)
  }

  getTerm(id: number) {
    return this.api.get(`${this.url}/${id}/terms`)
  }

  createPo(id: number, purchasingId: number, poList: {}) {
    return this.api.post(`${this.url}/${id}/${purchasingId}`, poList)
  }

}

type TSearchManyHead = {
  compType: string
  compCode?: string
  compName?: string
  goodCode?: string
}