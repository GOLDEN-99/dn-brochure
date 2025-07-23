import { inject, Injectable, signal } from '@angular/core';
import { BaseOiService, TDetailLight, TLightSummary } from './base-oi';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OiLightService extends BaseOiService {

  private url = environment.oi
  private term$ = new Subject<string>()
  private mode$ = new Subject<number>()
  private queryParam$ = combineLatest([this.mode$, this.term$]).pipe(filter(([m, t]) => m !== 0 && !!t))
  getAll(query: {}) {
    return this.api.get<TLightSummary[]>(`${this.url}/other-income/contact/light`, { params: query })
      .pipe(catchError(err => { console.log(err); return of([]) }))
  }
  private lightList$ = this.queryParam$.pipe(switchMap(([mode, term]) => this.getAll({ mode, term })))
  lightList = toSignal(this.lightList$, { initialValue: [] })
  searchMany(mode: number, term: string) {
    this.mode$.next(mode)
    this.term$.next(term)
  }

  private fetch$ = new BehaviorSubject<boolean>(true)
  refetch() {
    this.fetch$.next(true)
  }
  private id$ = new Subject<number>()
  private param$ = combineLatest([this.fetch$, this.id$])
  fetchById(id: number) {
    this.id$.next(id)
  }

  getById(id: number): Observable<TDetailLight[]> {
    return this.api.get<TDetailLight[]>(`${this.url}/other-income/contact/light/${id}`)
      .pipe(
        catchError(err => { console.log(err); return of([]); })
      )
  }
  private singleRecord$ = this.param$.pipe(switchMap(([_, id]) => this.getById(id)))
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


