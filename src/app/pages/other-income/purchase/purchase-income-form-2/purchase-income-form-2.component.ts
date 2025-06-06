import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OtherSearchSupplierModalComponent } from "../../../../components/other-income/other-search-supplier-modal/other-search-supplier-modal.component";
import { SearchProductModalComponent } from "../../../../components/other-income/search-product-modal/search-product-modal.component";

@Component({
  selector: 'app-purchase-income-form-2',
  imports: [FormsModule, OtherSearchSupplierModalComponent, SearchProductModalComponent],
  templateUrl: './purchase-income-form-2.component.html',
  styleUrl: './purchase-income-form-2.component.scss'
})
export class PurchaseIncomeForm2Component {
  compCode = signal("")
  compName = signal("")
  // selectComp({ compCode, compName }: TComp) {
  //   this.productList.update(() => [])
  //   this.compCode.update(() => compCode)
  //   this.compName.update(() => compName)
  //   this.modalService.dismissAll()
  // }
  notSelectComp = computed(() => this.compCode() === '' || this.compName() === '')

  incVat = signal<boolean>(false)

  limit = signal(false)
  limitAmount = signal(0)
  invalidLimitAmount = computed(() => this.limit() && this.limitAmount() === 0)


  // step = signal<TStepItem[]>([{ start: 0, percent: 0 }])
  // productList = signal<TProduct[]>([])
  // private modalService = inject(NgbModal)
  // private searchProductModal = viewChild('searchProductModal')
  // openSearchProduct() {
  //   const ref = this.modalService.open(this.searchProductModal())
  // }

  private productIdSet = new Set<number>()
  // onSelectProduct(products: TProduct[]) {
  //   const validProduct = products.flatMap((p) => {
  //     const hasValue = this.productIdSet.has(p.id)
  //     if (hasValue) return []
  //     this.productIdSet.add(p.id)
  //     return [p]
  //   })
  //   this.productList.update((p) => [...p, ...validProduct])
  //   this.modalService.dismissAll()
  // }
  // onRemoveProduct(id: number) {
  //   this.productList.update(p => p.filter((p) => p.id !== id))
  //   this.productIdSet.delete(id)
  // }

  // private searchSupplierModal = viewChild('searchSupplierModal')
  // openSearchSupplier() {
  //   const ref = this.modalService.open(this.searchSupplierModal())
  // }
}

type TComp = {
  compCode: string
  compName: string
}
