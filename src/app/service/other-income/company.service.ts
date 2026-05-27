import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { catchError, combineLatest, filter, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TCompType } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor() { }

  private readonly api = inject(ApiService)
  private readonly url = `${environment.oi}/other-income/comp`
  group = signal<TCompType>('DN')
  field = signal<TCompField>('name')
  term = signal('')
  private readonly group$ = toObservable(this.group)
  private readonly field$ = toObservable(this.field)
  private readonly term$ = toObservable(this.term)
  private readonly params$ = combineLatest([this.group$, this.field$, this.term$]).pipe(
    filter(() => true)
  )
  private readonly dnComp$ = this.params$.pipe(switchMap(([group, field, term]) => this.fetchCtrl(group, { [field]: term })))

  compList = toSignal(this.dnComp$, { initialValue: [] })

  fetchCtrl = (group: TCompType, params: TQuery) =>
    this.api.get<TOIComp[]>(`${this.url}/${group}`, { params })
      .pipe(catchError(err => { console.log(err); return of([] as TOIComp[]) }))
}

type TQuery = Record<string, string>
type TCompField = 'name' | 'code'
export type TOIComp = { compCode: string, compName: string, compType: string, compName2: string, compGroupCode: string }
