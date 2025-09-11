import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { TCompDetailRes, TCompProduct, TDNComp, TGeneratedCompCode, THUComp } from '../../types/ibob-supplier.type';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, map, Subject, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierApiService {

  constructor() { }

  private api = inject(ApiService)
  private url = environment.ibob

  private generatedCode$ = this.api.get<TGeneratedCompCode>(`${this.url}/GetCompInfoCreate`)

  generatedCode = toSignal(this.generatedCode$, { initialValue: null })
  selectedCode = computed(() => {
    const cur = this.generatedCode()
    if (!cur) return 'มีข้อผิดพลาด'
    switch (this.compType()) {
      case 'DN': return cur.dnCompCode
      case 'HU': return cur.compCode
      default: return 'มีข้อผิดพลาด'
    }
  })

  createSupplier = (req: TCreateSupplierReq) => this.api.post(`${this.url}/CreateCompInfo`, req, {})

  private fetch$ = new BehaviorSubject('1')

  private compCode$ = new Subject<string>()

  compType = signal('DN')
  compType$ = toObservable(this.compType)

  setCompType(value: string) {
    this.compType.set(value.toUpperCase())
  }

  private params$ = combineLatest({
    compCode: this.compCode$,
    compMode: this.compType$
  })

  // private main$ = this.fetch$.pipe(
  //   switchMap(
  //     () => this.params$
  //       .pipe(
  //         switchMap(
  //           ({ compCode, compMode }) => compMode.toUpperCase() === 'DN'
  //             ? this.getDNByCompCode(compCode)
  //             : this.getHUByCompCode(compCode)
  //         ),
  //         catchError(err => throwError(() => err))
  //       )
  //   ),
  //   catchError(err => throwError(() => err))
  // )

  private getDNByCompCode = (comp: string) =>
    this.api.get<TCompDetailRes>(`${this.url}/GetCompSubRes/${comp}/DN`)
      .pipe(
        tap(({ dn, item }) => {
          this.dnComp.update(() => dn)
          this.dnProduct.update(() => item)
        })
      )

  private dnComp = signal<TDNComp | null>(null)
  private dnProduct = signal<TCompProduct[]>([])

  private getHUByCompCode = (comp: string) =>
    this.api.get<TCompDetailRes>(`${this.url}/GetCompSubRes/${comp}/HU`)
      .pipe(
        tap(({ hu, item }) => {
          this.huComp.update(() => hu)
          this.huProduct.update(() => item)
        })
      )

  private huComp = signal<THUComp | null>(null)
  private huProduct = signal<TCompProduct[]>([])
}

type TBaseSupplier = {
  compCode: string;
  compName: string;
  compAddr: string;
  compPhone: string;
  compFax: string;
  compEmail: string;
  compGroupCode: string;
  orderRemark: string;
  orderFileType: string | null; // pdf ???
  compName2: string;
  compStat: string; // '1'
  paymentTerms: number;
  timeStamp: string | null; // ISO date string
  updateDate: string | null; // ISO date string
  sapUpdateDate: string | null; // ISO date string
  parentCompCode: string;
  billIncludeVAT: string;
  cashPerDisc: number;
  tradePerDisc: number;
  dcPerDisc: number;
  username: string;
  userpass: string;
}

export type THUCreate = {
  saleName: string;
  shipTo: string;
  fixedPrice: string;
  registered: string;
  supReturn: string;
  stkReturn: string;
  supFullBox: string;
  stkFullBox: string;
  supSameLot: string;
  stkSameLot: string;
  supMonthBeforeExp: number;
  stkMonthBeforeExp: number;
  supMonthAfterExp: number;
  stkMonthAfterExp: number;
} & TBaseSupplier

export type TDNCreate = TBaseSupplier

export type TItem = {
  goodCode: string;
  goodName: string;
  goodStat: string;
  isShipTo: string;
  supReturn: string;
  supMonthBeforeExp: string;
  supMonthAfterExp: string;
  supFullBox: string;
  supSameLot: string;
  stkReturn: string;
  stkFullBox: string;
  stkSameLot: string;
  stkMonthBeforeExp: string;
  stkMonthAfterExp: string;
}

export type TCreateSupplierReq = {
  hu: THUCreate | null
  dn: TDNCreate | null
  item: TItem[]
}
