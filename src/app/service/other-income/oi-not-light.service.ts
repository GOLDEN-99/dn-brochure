import { Injectable, Signal } from '@angular/core';
import { TInsertMonthlyIncome } from '../../types';
import { BaseOiService, ManyContactResponse, NotLightSingle } from './base-oi';
import { BehaviorSubject, catchError, combineLatest, Observable, of, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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

  private readonly queryParam$ = new Subject<TSearchManyHead>()

  private readonly notLight$ = this.queryParam$.pipe(
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

  private readonly fetch$ = new BehaviorSubject<boolean>(true)
  refetch = () => this.fetch$.next(true)
  private readonly id$ = new Subject<number>()
  private readonly comp2$ = new Subject<string>()
  private readonly param$ = combineLatest([this.fetch$, this.id$, this.comp2$])
  fetchById(id: number, compType: string) {
    this.id$.next(id)
    this.comp2$.next(compType)
  }

  private readonly singleRecord$ = this.param$
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

  deleteContact(id: number) {
    return this.api.delete(`${this.url}/other-income/contact/${id}`)
  }

}

type TSearchManyHead = {
  compType: string
  compCode?: string
  compName?: string
  goodCode?: string
}