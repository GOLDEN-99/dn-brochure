import { computed, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { TCompDetailRes, TGeneratedCompCode, } from '../../types/ibob-supplier.type';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { TDNCreate, THUCreate, TItem } from './shared.type';
import { IBOB_COMP_TYPE_TOKEN, TExtendedComp } from './supplier.token';
import { getOrElse } from '../../lib/utli';
import { extractSaleName, itemMapper, normalizeComp, transformCompInfo } from './lib-ibob';

export class SupplierApiService {
  constructor(public compType: string) { }
  private url = environment.ibob
  private api = inject(ApiService)
  private getCompCode = () => this.api.get<TGeneratedCompCode>(`${this.url}/GetCompInfoCreate`)
  private refetch$ = new BehaviorSubject(true)
  refetch() {
    this.refetch$.next(true)
  }
  generatedCode$ = this.refetch$.pipe(switchMap((val) => this.getCompCode()))
  generatedCode = toSignal(this.generatedCode$, { initialValue: null })
  selectedCode = computed(() => {
    const cur = this.generatedCode()
    if (!cur) return 'มีข้อผิดพลาด'
    switch (this.compType) {
      case 'DN': return cur.dnCompCode
      case 'HU': return cur.compCode
      default: return 'มีข้อผิดพลาด'
    }
  })

  createSupplier = (hu: Omit<THUCreate, 'compCode'>, dn: Omit<TDNCreate, 'compCode'>, item: TItem[]) => {
    const genComp = this.generatedCode()
    if (!genComp) throw new Error('cannot get comp code')
    const { dnCompCode, compCode } = genComp
    return this.api.post(`${this.url}/CreateCompInfo`, { hu: { ...hu, compCode }, dn: { ...dn, compCode: dnCompCode }, item }, {})
  }

  createDnSupplier = (req: Omit<TDNCreate, 'compCode'>, item: TItem[]) => {
    const genComp = this.generatedCode()
    if (!genComp) throw new Error('cannot get comp code')
    const { dnCompCode } = genComp
    return this.api.post(`${this.url}/CreateCompInfo`, { hu: null, dn: { ...req, compCode: dnCompCode }, item }, {})
  }

  createHuSupplier = (req: Omit<THUCreate, 'compCode'>, item: TItem[]) => {
    const genComp = this.generatedCode()
    if (!genComp) throw new Error('cannot get comp code')
    const { compCode } = genComp
    return this.api.post(`${this.url}/CreateCompInfo`, { dn: null, hu: { ...req, compCode }, item }, {})
  }

  private fetch$ = new BehaviorSubject('1')

  getCompInfoById(compCode: string) {
    this.singleCompCode.set(compCode)
  }
  singleCompCode = signal("")
  eqComp$ = toObservable(this.singleCompCode).pipe(filter(c => c !== ''))
  private fetchFn = (compCode: string) =>
    this.api.get<TCompDetailRes>(`${this.url}/GetCompSubRes/${compCode}/${this.compType}`)
  // search single
  private compData$ = this.eqComp$.pipe(switchMap((req) => this.fetchFn(req)))
  // private sharedComp$ = this.compData$
  //   .pipe(shareReplay(3))
  formmatComp$ = this.compData$.pipe(map(transformCompInfo))
  // private compInfo$ = this.sharedComp$
  //   .pipe(map(res => normalizeComp(res)))
  // compInfo = toSignal(this.compInfo$, { initialValue: {} })

  // private compItem$ = this.sharedComp$
  //   .pipe(map(({ item }) => item.map(i => itemMapper(i))))
  // compItem = toSignal(this.compItem$, { initialValue: [] })


  // search many
  term = signal('')
  compCode = signal('')
  private term$ = toObservable(this.term).pipe(distinctUntilChanged(), debounceTime(300))
  private searchCompCode$ = toObservable(this.compCode).pipe(distinctUntilChanged(), debounceTime(300))
  searchMany$ = combineLatest(
    [this.term$, this.searchCompCode$]
  ).pipe(
    filter(([term, compCode]) => term !== '' || compCode !== ''),
    map(([term, compCode]) => ({ term, compCode }))
  )
  compList$ = this.searchMany$
    .pipe(
      switchMap(
        ({ term, compCode }) => this.api.get<TExtendedComp[]>(
          `${environment.oi}/comp/${this.compType}`,
          { params: { term, compCode } }
        )),
      getOrElse<TExtendedComp[]>([])
    )
  compList = toSignal(this.compList$, { initialValue: [] })
}

