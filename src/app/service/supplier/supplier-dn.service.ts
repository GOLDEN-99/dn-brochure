import { inject, Injectable, Signal, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ISupplierList, TExtendedComp } from './supplier.token';
import { TCompDetailRes, TCompProduct, TDNComp, TDNCompRes, THUComp } from '../../types/ibob-supplier.type';
import { environment } from '../../../environments/environment';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getOrElse } from '../../lib/utli';
import { TEmplState, TFormState, TIbAppItem } from './shared.type';
import { dnCompMapper, huCompMapper, itemMapper, toBoolAdapter, toIsShipAdapter, toNumberAdapter } from './lib-ibob';

@Injectable({
  providedIn: 'root'
})
export class SupplierDnService implements ISupplierList {

  term = signal('')
  compCode = signal('')
  private term$ = toObservable(this.term).pipe(distinctUntilChanged(), debounceTime(300))
  private searchCompCode$ = toObservable(this.compCode).pipe(distinctUntilChanged(), debounceTime(300))
  private searchMany$ = combineLatest([this.term$, this.searchCompCode$])
    .pipe(
      map(([term, compCode]) => ({ term, compCode })),
      filter(({ compCode, term }) => compCode !== '' || term !== '')
    )
  private api = inject(ApiService)

  private url = environment.ibob

  searchCompCode = (compCode: string) => this.compCode$.next(compCode)

  private fetchFn = (compCode: string) => this.api.get<TCompDetailRes>(`${this.url}/GetCompSubRes/${compCode}/DN`)
  compCode$ = new Subject<string>()
  private compData$ = this.compCode$.pipe(switchMap(this.fetchFn))
  private sharedComp$ = this.compData$.pipe(shareReplay(2))

  private compInfo$ = this.sharedComp$.pipe(map<TCompDetailRes, Partial<TFormState>>(({ dn, hu }) => {
    if (dn === null && hu !== null) {
      return huCompMapper(hu);
    }
    if (dn !== null && hu === null) {
      return dnCompMapper(dn);
    }
    throw new Error("invalid comp response")
  }))
  compRes = toSignal(this.compInfo$, { initialValue: {} })
  private compItem$ = this.sharedComp$.pipe(map<TCompDetailRes, TIbAppItem[]>(
    ({ item }) => item.map(i => itemMapper(i))))
  compBase = signal<TDNComp | null>(null)
  compItem = toSignal(this.compItem$, { initialValue: [] })
  private saleName$ = this.sharedComp$.pipe(map(({ dn, hu }) => {
    if (dn === null && hu !== null) {
      return hu.saleName
    }
    if (dn !== null && hu === null) {
      return ''
    }
    throw new Error("invalid comp response")
  }))
  saleName = toSignal(this.saleName$, { initialValue: '' })
  private compProduct$ = this.sharedComp$.pipe(map(({ item }) => item), tap(products => this.product.update(() => products)), takeUntilDestroyed())

  product = signal<TCompProduct[]>([])

  pageLabel: Signal<'DN' | 'HU'> = signal('DN')
  compList$ = this.searchMany$.pipe(
    switchMap(params => this.api.get<TExtendedComp[]>(`${environment.oi}/comp/dn`, { params })),
    getOrElse<TExtendedComp[]>([])
  )
  compList: Signal<TExtendedComp[]> = toSignal(this.compList$, { initialValue: [] })

}
