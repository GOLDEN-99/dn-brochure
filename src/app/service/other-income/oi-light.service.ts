import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BaseOiService } from './base-oi';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { TOIComp } from './company.service';
import { TEvent } from './event.service';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OiLightService extends BaseOiService {

  private url = environment.oi

  getAll(query: {}) {
    return this.api.get<TLightSummary[]>(`${this.url}/other-income/contact/light`, { params: query })
      .pipe(catchError(err => { console.log(err); return of([]) }))
  }
  private lightList$ = this.getAll({})
  lightList = toSignal(this.lightList$, { initialValue: [] })

  private fetch$ = new BehaviorSubject<boolean>(true)
  private id$ = new Subject<number>()
  private param$ = combineLatest([this.fetch$, this.id$]).pipe(map(((f, id) => id)))
  fetchById(id: number) {
    this.id$.next(id)
  }

  getById(id: number): Observable<TDetailLight[]> {
    return this.api.get<TDetailLight[]>(`${this.url}/${id}`)
      .pipe(
        catchError(err => { console.log(err); return of([]); })
      )
  }
  private singleRecord$ = this.param$.pipe(switchMap((id) => this.getById(id)))
  singleRecord = toSignal(this.singleRecord$, { initialValue: [] })

  create(req: {}) {
    return this.api.post(this.url, {})
  }

  update(id: number, body: {}) {
    return this.api.post(`${this.url}/${id}`, body)
  }

  addBranch(id: number, body: {}) {
    return this.api.post(`${this.url}/${id}/branch`, body)
  }

}


type TLightSummary = {
  id: number
  lightId: number
  period: number
  startDate: string
  endDate: string
  totalBranch: number
  totalAmount: number
  company: TOIComp
  event: TEvent,
}



type TDetailLight = {

} & TLightSummary