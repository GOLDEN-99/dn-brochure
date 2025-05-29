import { computed, inject, Injectable, OnDestroy } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, catchError, combineLatest, filter, map, of, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import { TFlashSaleItem, TFlashSaleReq, TZone } from '../../../types';
import { toSignal } from '@angular/core/rxjs-interop';
import { transformItemList } from '../../../lib';

@Injectable({
  providedIn: 'root'
})
export class FlashSaleService implements OnDestroy {

  constructor() { }

  private api = inject(ApiService)

  private url = environment.brochureEndpoint

  private idPromotion$ = new Subject<number>()
  private zone$ = new Subject<TZone>()

  search = ({ idPromotion, zone }: { idPromotion: string | number, zone: TZone }) => {
    this.idPromotion$.next(Number(idPromotion))
    this.zone$.next(zone)
  }

  private predicateNull = (p: { idPromotion: number | null, zone: TZone | null }): p is TFlashParams => {
    return p.idPromotion !== null && p.zone !== null
  }

  private params$ = combineLatest({
    idPromotion: this.idPromotion$,
    zone: this.zone$
  }).pipe(
    filter(this.predicateNull)
  )

  private fetchFlashSale = (req: TFlashParams) =>
    this.api.post<TFlashSaleReq>(`${this.url}/PaperProFlash`, req)
      .pipe(catchError((err) => {
        console.log(err)
        return of({ head: null, list: [] as TFlashSaleItem[] })
      }))

  private res$ = this.params$.pipe(switchMap(this.fetchFlashSale))

  private sharedRes$ = this.res$.pipe(shareReplay(1))

  head$ = this.sharedRes$.pipe(
    map(response => response.head)
  )

  list$ = this.sharedRes$.pipe(
    map(
      response => response.list
    )
  )

  head = toSignal(this.head$, { initialValue: null })

  list = toSignal(this.list$, { initialValue: [] })

  formattedList = computed(() => this.list().reduce<TFlashSaleItem[][]>(transformItemList(3), []))

  ngOnDestroy() {
    this.idPromotion$.complete()
    this.zone$.complete()
  }
}


type TFlashParams = {
  idPromotion: number
  zone: TZone
}
