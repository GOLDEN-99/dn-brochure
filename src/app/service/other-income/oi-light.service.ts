import { inject, Injectable, signal } from '@angular/core';
import { BaseOiService, ManyContactLightResponse, TDetailLight } from './base-oi';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, shareReplay, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OiLightService extends BaseOiService {

  private goodCode$ = new Subject<string>()
  private compCode$ = new Subject<string>()
  private compName$ = new Subject<string>()
  private compType$ = new Subject<number>() // code | good
  private sharedComp$ = this.compType$.pipe(
    map((compType) => compType === 1 ? "DN" : "HU"),
    shareReplay(1)
  )
  private queryParam$ = new Subject<TSearchManyHead>()
  getAll({ compType, query }: { compType: string, query: {} }) {
    return this.api.get<ManyContactLightResponse[]>(`${this.url}/other-income/contact/light/${compType}`, { params: query })
      .pipe(catchError(err => { console.log(err); return of([]) }))
  }
  private lightList$ = this.queryParam$.pipe(switchMap(({ compType, ...res }) => this.getAll({ compType, query: res })))
  lightList = toSignal(this.lightList$, { initialValue: [] })
  searchMany(req: TSearchManyHead) {
    this.queryParam$.next(req)
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
