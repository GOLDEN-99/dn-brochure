import { effect, inject, Injectable, model, signal } from '@angular/core';

import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { TAppGoodItem, TAppLot, TGoodItem } from '../../types/cn.type';


@Injectable({
  providedIn: 'root'
})
export class SearchBarcodeService {

  constructor() {
    this.search$.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(this.fetch)
    ).subscribe({
      next: data => this.products.update(prev => data ? [data] : []),
      error: (err) => console.log(err)
    })

    const pro = effect(() => console.log(this.products()))
  }

  private url = `${environment.cnPath}/GetBarCode`

  search = signal("")

  onSearch(term: string) {
    this.search.update(() => term)
  }

  private search$ = toObservable(this.search)

  private api = inject(ApiService)

  private fetch = (term: string) => this.api.get<TSearchResult>(`${this.url}/${term}`)
    .pipe(
      map(this.mapCheck),
      catchError(err => { console.log(err); return of(null) })
    )

  private mapCheck = ({ lot, ...res }: TSearchResult): TAppGoodItem =>
    ({ ...res, check: true, subTotal: 0, lot: lot.map(l => ({ ...l, check: false, goodAmou: 0, returnAmou: 0 })) })

  products = signal<TAppGoodItem[]>([])

}

type TSearchLot = Omit<TAppLot, 'goodAmou' | 'returnAmou'>

type TSearchResult = { lot: TSearchLot[] } & Omit<TAppGoodItem, 'lot'>