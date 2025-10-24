import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, combineLatest, filter, forkJoin, map, of, Subject, switchMap, tap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ISerachComp } from './oi.token';
import { TCompType } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor() { }

  private api = inject(ApiService)
  private url = `${environment.oi}/other-income/comp`
  group = signal<TCompType>('DN')
  field = signal<TCompField>('name')
  term = signal('')
  private group$ = toObservable(this.group)
  private field$ = toObservable(this.field)
  private term$ = toObservable(this.term)
  private params$ = combineLatest([this.group$, this.field$, this.term$]).pipe(
    filter(() => true)
  )
  private dnComp$ = this.params$.pipe(switchMap(([group, field, term]) => this.fetchCtrl(group, { [field]: term })))

  compList = toSignal(this.dnComp$, { initialValue: [] })

  fetchCtrl = (group: TCompType, params: TQuery) =>
    this.api.get<TOIComp[]>(`${this.url}/${group}`, { params })
      .pipe(catchError(err => { console.log(err); return of([] as TOIComp[]) }))
}

type TQuery = Record<string, string>
type TCompField = 'name' | 'code'
export type TOIComp = { compCode: string, compName: string, compType: string, compName2: string, compGroupCode: string }
