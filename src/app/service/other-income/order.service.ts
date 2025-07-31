import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, distinctUntilChanged, filter, Observable, of, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor() { }

  private api = inject(ApiService)
  private url = environment.oi

  term = signal("")
  private term$ = toObservable(this.term).pipe(distinctUntilChanged(), filter(term => !!term))
  private compType$ = new Subject<string>()
  private compCode$ = new Subject<string>()
  private params = combineLatest([this.compType$, this.compCode$, this.term$,])
  private search(compType: string, compCode: string, order: string): Observable<TOiOrder[]> {
    return this.api.get<TOiOrder[]>(
      `${this.url}/po/${compType}/${compCode}`,
      { params: { order } }
    ).pipe(catchError(err => of([])))
  }
  private poList$ = this.params.pipe(
    switchMap(([type, code, order]) => this.search(type, code, order)),
  )
  setComp(compCode: string, compType: string) {
    if (compType !== 'DN' && compType !== 'HU') return
    this.compCode$.next(compCode)
    this.compType$.next(compType)
  }
  queryOrder = toSignal(this.poList$, { initialValue: [] })
}

export type TOiOrder = {
  orderNumb: string
}

export type TAppOIOrder = {
  actualAmount: number
} & TOiOrder

