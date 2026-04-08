import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../api/api.service';
import { TAppGoodItem, TAppLot } from '../../../types/cn.type';


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
  }

  private readonly url = `${environment.cnPath}/GetBarCode`

  search = signal("")

  onSearch(term: string) {
    this.search.update(() => term)
  }

  private readonly search$ = toObservable(this.search)

  private readonly api = inject(ApiService)

  private readonly fetch = (term: string) => this.api.get<TSearchResult>(`${this.url}/${term}`)
    .pipe(
      map(this.mapCheck),
      catchError(err => { console.log(err); return of(null) })
    )

  private readonly mapCheck = ({ lot, ...res }: TSearchResult): TAppGoodItem =>
    ({ ...res, check: true, subTotal: 0, lot: this.makeDistinct(lot) })

  private readonly makeDistinct = (data: TSearchLot[]): TAppLot[] => {
    const ref = new Map<string, boolean>()
    return data.flatMap(d => {
      const lot = d.lotNumber
      if (!lot) {
        const exp = d.expiDate
        const hasValue = ref.has(exp)
        if (hasValue) return []
        ref.set(exp, true)
        return [{ ...d, check: false, goodAmou: 0, returnAmou: 0 }]
      }
      const hasValue = ref.has(lot)
      if (hasValue) return []
      ref.set(lot, true)
      return [{ ...d, check: false, goodAmou: 0, returnAmou: 0 }]
    })
  }

  products = signal<TAppGoodItem[]>([])

}

type TSearchLot = Omit<TAppLot, 'goodAmou' | 'returnAmou'>

type TSearchResult = { lot: TSearchLot[] } & Omit<TAppGoodItem, 'lot'>