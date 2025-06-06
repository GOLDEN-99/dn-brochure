import { Component, computed, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-product-modal',
  imports: [FormsModule],
  templateUrl: './search-product-modal.component.html',
  styleUrl: './search-product-modal.component.scss'
})
export class SearchProductModalComponent {
  term = signal("")
  result = signal<TProduct[]>([
    { check: false, name: 'product 1', id: 1 }, { check: true, name: 'product 2', id: 2 }
  ])

  isSelectAllItem = computed(() => this.result().every(({ check }) => check))
  selectAll() {
    const current = this.isSelectAllItem()
    this.result.update(prev => prev.map((p) => ({ ...p, check: !current })))
  }

  selectedList = computed(() => this.result().flatMap((p) => p.check ? [p] : []))
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

type TProduct = { name: string, check: boolean, id: number }
