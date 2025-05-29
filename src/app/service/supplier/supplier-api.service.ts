import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { TCompDetailRes, TCompProduct, TDNComp, TGeneratedCompCode, THUComp } from '../../types/ibob-supplier.type';
import { toSignal } from '@angular/core/rxjs-interop';
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

  createSupplier = (req: TCreateSupplierReq) => this.api.post(`${this.url}/CreateCompInfo`, req, {})

  private fetch$ = new BehaviorSubject('1')

  private compCode$ = new Subject<string>()

  private compMode$ = new Subject<'DN' | 'HU'>()

  private params$ = combineLatest({
    compCode: this.compCode$,
    compMode: this.compMode$
  })

  private main$ = this.fetch$.pipe(
    switchMap(
      () => this.params$
        .pipe(
          switchMap(
            ({ compCode, compMode }) => compMode === 'DN'
              ? this.getDNByCompCode(compCode)
              : this.getHUByCompCode(compCode)
          ),
          catchError(err => throwError(() => err))
        )
    ),
    catchError(err => throwError(() => err))
  )

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

export type TCreateSupplierReq = {}
