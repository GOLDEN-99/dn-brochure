import { Component, computed, inject, model, signal } from '@angular/core';
import { CnApiService } from '../../services/cn-api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TGoodItemState } from '../../types/cn.type';
import { FormValueControl } from '@angular/forms/signals';
import { TGoodFormItem } from '../../services/cn-state.service';

@Component({
  selector: 'cn-product-picker',
  imports: [FormsModule],
  templateUrl: './cn-product-picker.component.html',
  styleUrl: './cn-product-picker.component.scss',
})
export class CnProductPickerComponent implements FormValueControl<Array<TGoodFormItem>> {
  value = model<Array<TGoodFormItem>>([])
  ref = computed(() => new Set(this.value().map(good => good.good.goodCode)))
  private readonly cnClient = inject(CnApiService)
  search = signal('');
  private readonly search$ = toObservable(this.search);
  private readonly products$ = this.search$.pipe(
    distinctUntilChanged(), debounceTime(300),
    switchMap((search) => this.cnClient.searchProductByBarcode(search))
  )
  productList = toSignal(this.products$, { initialValue: [] })
  renderList = computed(() => {
    const ref = this.ref()
    return this.productList().filter(({ goodCode }) => !ref.has(goodCode))
  })
  addItem(product: TGoodItemState) {
    this.value.update(prev => [...prev, { good: product, check: true, amount: 0 }])
  }
}
