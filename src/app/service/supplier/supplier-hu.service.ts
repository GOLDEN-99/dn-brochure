import { inject, Injectable, Signal, signal } from '@angular/core';
import { TSupplierItem } from '../../types';
import { ApiService } from '../api/api.service';
import { ISupplierList, TExtendedComp } from './supplier.token';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TCompProduct, THUComp, THUCompRes } from '../../types/ibob-supplier.type';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getOrElse } from '../../lib/utli';

@Injectable({
  providedIn: 'root'
})
export class SupplierHuService implements ISupplierList {

  constructor() {
    this.compBase$.subscribe()
    this.compProduct$.subscribe()
  }

  private api = inject(ApiService)

  private url = environment.ibob

  term = signal('')
  compCode = signal('')
  private term$ = toObservable(this.term)
    .pipe(
      distinctUntilChanged(),
      debounceTime(300)
    )
  private searchCompCode$ = toObservable(this.compCode)
    .pipe(
      distinctUntilChanged(),
      debounceTime(300)
    )
  private searchMany$ = combineLatest([this.term$, this.searchCompCode$])
    .pipe(
      map(([term, compCode]) => ({ term, compCode })),
      filter(({ compCode, term }) => compCode !== '' || term !== '')
    )
  searchCompCode = (compCode: string) => this.compCode$.next(compCode)
  private fetchFn = (compCode: string) => this.api.get<THUCompRes>(`${this.url}/GetCompSubRes/${compCode}/HU`)

  compCode$ = new Subject<string>()

  private compData$ = this.compCode$.pipe(distinctUntilChanged(), switchMap(this.fetchFn))

  private sharedComp$ = this.compData$.pipe(shareReplay(1))

  private compBase$ = this.sharedComp$.pipe(map(({ hu }) => hu), tap(hu => this.compBase.update(() => hu)), takeUntilDestroyed())

  compBase = signal<THUComp | null>(null)

  private compProduct$ = this.sharedComp$.pipe(map(({ item }) => item), tap(products => this.product.update(() => products)), takeUntilDestroyed())

  product = signal<TCompProduct[]>([])

  data = signal<TSupplierItem[]>([{
    username: 'test',
    password: 'test',
    supName: 'sup A',
    email: 'supA@test.com',
    address: 'อาคารสำนักงานใหญ่ เลขที่ 26/56-57 ซอย, 62/2 King Kaeo Rd, Racha Thewa, Bang Phli District, Samut Prakan 10540',
    tel: '0888888888'
  }])
  pageLabel: Signal<'DN' | 'HU'> = signal('HU')
  compList$ = this.searchMany$.pipe(
    switchMap(params => this.api.get<TExtendedComp[]>(`${environment.oi}/comp/hu`, { params })),
    getOrElse<TExtendedComp[], TExtendedComp[]>([])
  )
  compList: Signal<TExtendedComp[]> = toSignal(this.compList$, { initialValue: [] })

}
