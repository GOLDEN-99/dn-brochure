import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OiProductService } from '../../../../service/other-income/oi-product.service';
import { TOIProduct } from '../../../../types';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-search-product-subform',
  imports: [FormsModule],
  templateUrl: './search-product-subform.component.html',
  styleUrl: './search-product-subform.component.scss'
})
export class SearchProductSubformComponent {
  private productService = inject(OiProductService)
  comp = input.required<{ compCode: string, compType: string }>()
  term = this.productService.term
  result = this.productService.product

  isSelectAllItem = computed(() => this.result().every(({ check }) => check))
  selectAll = this.productService.selectAll

  selectedList = computed(() => this.result().filter(({ check }) => check))
  selectProducts = input<TOIProduct[]>([])
  onAdd = output<TOIProduct[]>()
  onDelete = output<string>()
  selectSomeProduct = this.productService.toggleProduct

  delete(goodCode: string) {
    this.onDelete.emit(goodCode)
  }

  submit() {
    this.onAdd.emit(this.selectedList());
    this.modalService.dismissAll();
  }

  productList = signal<any[]>([])
  onRemoveProduct = (goodCode: string) => this.productList.update(prev => prev.filter((p) => p.goodCode !== goodCode))

  productModal = viewChild("searchProductModal")
  private modalService = inject(NgbModal)
  openSearchProduct() {
    const { compCode, compType } = this.comp();
    this.productService.setComp(compCode, compType);
    this.modalService.open(this.productModal())
  }
}
