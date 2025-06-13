import { Component, computed, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TProduct } from '../../../types';

@Component({
  selector: 'app-search-product-modal',
  imports: [FormsModule],
  templateUrl: './search-product-modal.component.html',
  styleUrl: './search-product-modal.component.scss'
})
export class SearchProductModalComponent {
  term = signal("")
  result = signal<TAppProduct[]>([
    { check: false, productName: 'product 1', id: '1' }, { check: true, productName: 'product 2', id: '2' }
  ])

  isSelectAllItem = computed(() => this.result().every(({ check }) => check))
  selectAll() {
    const current = this.isSelectAllItem()
    this.result.update(prev => prev.map((p) => ({ ...p, check: !current })))
  }

  selectedList = computed(() => this.result().flatMap(({ check, id, productName }) => check ? [{ id, productName }] : []))
  selectProduct = output<TProduct[]>()

  selectSomeProduct(id: number) {
    this.result.update(prev => prev.map((p, i) => i === id ? ({ ...p, check: !p.check }) : p))
  }

  close = output<void>()
  onClose() {
    this.close.emit()
  }

  submit() {
    this.selectProduct.emit(this.selectedList())
  }
}

type TAppProduct = { check: boolean } & TProduct
