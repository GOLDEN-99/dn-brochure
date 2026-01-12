import { Component, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, debounce, debounceTime, distinctUntilChanged, map, tap } from 'rxjs';


@Component({
  selector: 'app-quota-item-list',
  imports: [FormsModule],
  templateUrl: './quota-item-list.component.html',
  styleUrl: './quota-item-list.component.scss'
})
export class QuotaItemListComponent {
  searchQuota = signal<TSearchQuotaRequest>({ barcode: '', goodName: '' })
  changeSearchName = (goodName: string) => this.searchQuota.update(prev => ({ ...prev, goodName }))
  changeCode = (barcode: string) => this.searchQuota.update(prev => ({ ...prev, barcode }))
  search$ = new BehaviorSubject(true)
  searchQuota$ = toObservable(this.searchQuota).pipe(debounceTime(300))
  query$ = combineLatest([this.search$, this.searchQuota$])
    .pipe(
      map(([__dirname, parma]) => parma),
      //distinctUntilChanged((o1, o2) => o1.barcode === o2.barcode && o1.goodName === o2.goodName),
      map(q => JSON.stringify(q)),
    )

  result = signal<TQuotaItem[]>([
    {
      barCode: '999001',
      goodName: 'mock product 1',
      quotaAmount: 100,
      saleQuota: 80,
      wholeSaleQuota: 48,
      goodSaleQuota: 32,
      newSaleQuota: 15,
      oldSaleQuota: 5
    }
  ]) // convert to api result
}

type TQuotaItem = {
  barCode: string
  goodName: string
  quotaAmount: number
  saleQuota: number //80%
  wholeSaleQuota: number
  goodSaleQuota: number
  oldSaleQuota: number
  newSaleQuota: number
}

type TSearchQuotaRequest = {
  barcode: string
  goodName: string
}