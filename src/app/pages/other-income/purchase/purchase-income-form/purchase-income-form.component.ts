import { Component, computed, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateInputComponent } from "../../../../components/date-input/date-input.component";
import { DiscountSubformComponent } from "../../../../components/other-income/form/discount-subform/discount-subform.component";
import { TargetSubformComponent } from "../../../../components/other-income/form/target-subform/target-subform.component";
import { OtherIncomeFormService } from '../../../../service/other-income/other-income-form.service';
import { SearchProductModalComponent } from "../../../../components/other-income/search-product-modal/search-product-modal.component";
import { OtherSearchSupplierModalComponent } from "../../../../components/other-income/other-search-supplier-modal/other-search-supplier-modal.component";
import { TProduct } from '../../../../types';
@Component({
  selector: 'app-purchase-income-form',
  imports: [FormsModule, NgbDatepickerModule, RouterLink, DateInputComponent, DiscountSubformComponent, TargetSubformComponent, SearchProductModalComponent, OtherSearchSupplierModalComponent],
  templateUrl: './purchase-income-form.component.html',
  styleUrl: './purchase-income-form.component.scss'
})
export class PurchaseIncomeFormComponent {

  private formServ = inject(OtherIncomeFormService)
  formState = this.formServ.state
  update = this.formServ.updator

  private modalService = inject(NgbModal)
  private searchProductModal = viewChild('searchProductModal')
  openSearchProduct() {
    const ref = this.modalService.open(this.searchProductModal())
  }
  currentProduct = computed(() => this.formState().productList)
  private setProductList = this.update('productList')
  private productIdSet = new Set<string>()
  onSelectProduct(products: TProduct[]) {
    console.table(products)
    const validProduct = products.flatMap((p) => {
      const hasValue = this.productIdSet.has(p.id)
      if (hasValue) return []
      this.productIdSet.add(p.id)
      return [p]
    })
    const currentProduct = this.currentProduct()
    const newProduct = [...currentProduct, ...validProduct]
    this.setProductList(newProduct)
    this.modalService.dismissAll()
  }
  onRemoveProduct(id: string) {
    const currentProduct = this.currentProduct()
    const newProduct = currentProduct.filter((p) => p.id !== id)
    this.setProductList(newProduct)
    this.productIdSet.delete(id)
  }

  private searchSupplierModal = viewChild('searchSupplierModal')
  openSearchSupplier() {
    const ref = this.modalService.open(this.searchSupplierModal())
  }
  selectComp({ compCode, compName }: TComp) {
    this.setProductList([])
    this.formServ.updateMany({ compCode, compName })
    this.modalService.dismissAll()
  }
  notSelectComp = this.formServ.notSelectComp

  // endPoint = computed(() => this.event() !== 0 ? '/other-income/purchase/create-1' : '/other-income/purchase')
  // endPointDisable = computed(() => this.invalidEvent() || this.invalidDiscountType() || this.invalidPeriod() ? 'btn btn-success disabled' : 'btn btn-success')
}

type TStepItem = {
  start: number
  percent: number
}

type TComp = {
  compCode: string
  compName: string
}