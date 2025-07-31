import { Component, computed, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OiProductService } from '../../../service/other-income/oi-product.service';

@Component({
  selector: 'app-search-product-modal',
  imports: [FormsModule],
  templateUrl: './search-product-modal.component.html',
  styleUrl: './search-product-modal.component.scss'
})
export class SearchProductModalComponent {
  private productService = inject(OiProductService)
  term = this.productService.term
  result = this.productService.product

  isSelectAllItem = computed(() => this.result().every(({ check }) => check))
  selectAll = this.productService.selectAll

  selectedList = computed(() => this.result().filter(({ check }) => check))
  selectProduct = output<TOIProduct[]>()

  selectSomeProduct = this.productService.toggleProduct

  close = output<void>()
  onClose() {
    this.close.emit()
  }

  submit() {
    this.selectProduct.emit(this.selectedList())
  }
}

type TAppProduct = { check: boolean, goodCode: string, goodName: string }
type TOIProduct = { goodCode: string, goodName: string }
