import { inject, Injectable, Signal, signal } from '@angular/core';
import { TSupplierItem } from '../../types';
import { ApiService } from '../api/api.service';
import { ISupplierList } from './supplier.token';
import { TCompProduct, TDNComp, TDNCompRes } from '../../types/ibob-supplier.type';
import { environment } from '../../../environments/environment';
import { map, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class SupplierDnService implements ISupplierList {

  constructor() {
    this.compBase$.subscribe()
    this.compProduct$.subscribe()
  }

  private api = inject(ApiService)

  private url = environment.ibob

  private compCode$ = new Subject<string>()

  searchCompCode = (compCode: string) => this.compCode$.next(compCode)

  private fetchFn = (compCode: string) => this.api.get<TDNCompRes>(`${this.url}/GetCompSubRes/${compCode}/DN`)

  private compData$ = this.compCode$.pipe(switchMap(this.fetchFn))

  private sharedComp$ = this.compData$.pipe(shareReplay(1))

  private compBase$ = this.sharedComp$.pipe(map(({ dn }) => dn), tap(dn => this.compBase.update(() => dn)), takeUntilDestroyed())

  compBase = signal<TDNComp | null>(null)

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
  pageLabel: Signal<'DN' | 'HU'> = signal('DN')
}
