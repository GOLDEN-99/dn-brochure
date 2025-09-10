import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, filter, map, of, switchMap } from 'rxjs';
import { getOrElse } from '../../lib/utli';

@Injectable({
  providedIn: 'root'
})
export class IbobCompService {

  constructor() { }

  private url = environment.oi
  private baseUrl = `${this.url}/comp`
  private api = inject(ApiService)
  private getCompGroup = (compType: string) =>
    this.api
      .get<TCompGroup[]>(`${this.baseUrl}/${compType}/group`)
      .pipe(
        getOrElse<TCompGroup[]>([])
      )
  private compType$ = new BehaviorSubject('')
  private compGroup$ = this.compType$
    .pipe(
      filter(c => c !== ''),
      switchMap(c => this.getCompGroup(c)),
      getOrElse<TCompGroup[]>([])
    )
  private term$ = new BehaviorSubject('')
  private debounceTerm$ = this.term$.pipe(
    distinctUntilChanged(),
    debounceTime(300)
  )
  private groupCode$ = new BehaviorSubject('')
  private compParam$ = combineLatest([this.compType$, this.groupCode$, this.debounceTerm$])
    .pipe(
      filter(([compType]) => compType !== ''),
      map(([compType, groupCode, term]) => ({ compType, groupCode, term })),
      switchMap(({ compType, groupCode, term }) => this.api.get(`${this.baseUrl}/${compType}`, { params: { groupCode, term } }))
    )

  setCompType(compType: string) {
    this.compType$.next(compType)
  }
}

type TCompGroup = {
  compGroupCode: string
  compGroupDesc: string
}