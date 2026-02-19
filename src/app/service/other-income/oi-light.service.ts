import { inject, Injectable } from '@angular/core';
import { TDetailLight } from './base-oi';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, of, Subject, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OiLightService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  getById(id: number, compType: string) {
    return this.api.get<TDetailLight[]>(`${this.url}/other-income/contact/light/${compType}/${id}`)
      .pipe(catchError(err => { console.log(err); return of([]); }))
  }

  private fetch$ = new BehaviorSubject<boolean>(true)
  refetch() {
    this.fetch$.next(true)
  }
  private id$ = new Subject<number>()
  private comp2$ = new Subject<string>()
  private param$ = combineLatest([this.fetch$, this.id$, this.comp2$])
  fetchById(id: number, compType: string) {
    this.id$.next(id)
    this.comp2$.next(compType)
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
