import { inject, Injectable, signal } from '@angular/core';
import { TInsertMonthlyIncome, TOIStepItem } from '../../types';
import { BaseOiService, NotLightSingle, NotLightSummary } from './base-oi';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, filter, map, of, Subject, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OiNotLightService extends BaseOiService {

  private url = environment.oi

  getAll(query: {}) {
    return this.api.get<NotLightSummary[]>(`${this.url}/other-income/contact/not-light`, { params: query })
      .pipe(catchError(err => of([])))
  }

  private term$ = new Subject<string>()
  private mode$ = new Subject<number>()
  private queryParam = combineLatest([this.mode$, this.term$]).pipe(filter(([mode, term]) => mode !== 0 && !!term))

  private notLight$ = this.queryParam.pipe(
    switchMap(([mode, term]) => this.getAll({ mode, term }))
  )
  searchMany(mode: number, term: string) {
    this.term$.next(term)
    this.mode$.next(mode)
  }

  notLightList = toSignal(this.notLight$, { initialValue: [] })

  getById(id: number) {
    return this.api.get<NotLightSingle[]>(`${this.url}/other-income/contact/not-light/${id}`)
      .pipe(catchError(err => {
        console.log(err);
        return of([]);
      }
      ))

  }

  private fetch$ = new BehaviorSubject<boolean>(true)
  refetch = () => this.fetch$.next(true)
  private id$ = new Subject<number>()
  private param$ = combineLatest([this.fetch$, this.id$])
  fetchById(id: number) {
    this.id$.next(id)
  }

  private singleRecord$ = this.param$
    .pipe(
      switchMap(([_, id]) => this.getById(id)),
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
