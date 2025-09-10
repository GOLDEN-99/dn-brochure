import { inject, Injectable, signal } from '@angular/core';
import { BaseOiService, ManyContactLightResponse, TDetailLight } from './base-oi';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, shareReplay, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OiLightService extends BaseOiService {

  private term$ = new Subject<string>()
  private mode$ = new Subject<number>()
  private compType$ = new Subject<number>() // code | good
  private sharedComp$ = this.compType$.pipe(
    map((compType) => compType === 1 ? "DN" : "HU"),
    shareReplay(1)
  )
  private queryParam$ = combineLatest([this.mode$, this.term$, this.sharedComp$])
    .pipe(
      filter(([m, t]) => m !== 0 && !!t),
      map(([mode, term, compType]) => ({ compType, query: { mode, term } }))
    )
  getAll({ compType, query }: { compType: string, query: {} }) {
    return this.api.get<ManyContactLightResponse[]>(`${this.url}/other-income/contact/light/${compType}`, { params: query })
      .pipe(catchError(err => { console.log(err); return of([]) }))
  }
  private lightList$ = this.queryParam$.pipe(switchMap((search) => this.getAll(search)))
  lightList = toSignal(this.lightList$, { initialValue: [] })
  searchMany(mode: number, term: string, compType: number) {
    this.mode$.next(mode)
    this.term$.next(term)
    this.compType$.next(compType)
  }

  private fetch$ = new BehaviorSubject<boolean>(true)
  refetch() {
    this.fetch$.next(true)
  }
  private id$ = new Subject<number>()
  private comp2$ = new Subject<string>
  private param$ = combineLatest([this.fetch$, this.id$, this.comp2$])
  fetchById(id: number, compType: string) {
    this.id$.next(id)
    this.comp2$.next(compType)
  }

  getById(id: number, compType: string): Observable<TDetailLight[]> {
    return this.api.get<TDetailLight[]>(`${this.url}/other-income/contact/light/${compType}/${id}`)
      .pipe(
        catchError(err => { console.log(err); return of([]); })
      )
  }
  private singleRecord$ = this.param$.pipe(switchMap(([_, id, sharedComp]) => this.getById(id, sharedComp)))
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


