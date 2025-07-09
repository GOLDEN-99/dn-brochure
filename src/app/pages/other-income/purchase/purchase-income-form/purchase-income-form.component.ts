import { Component, computed, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeFormService } from '../../../../service/other-income/other-income-form.service';
import { TOIProduct } from '../../../../types';
import { OtherIncomeBaseformComponent } from "../../../../components/other-income/form/other-income-baseform/other-income-baseform.component";
import { OiBaseformService } from '../../../../service/other-income/oi-baseform.service';
@Component({
  selector: 'app-purchase-income-form',
  imports: [FormsModule, NgbDatepickerModule, RouterLink, OtherIncomeBaseformComponent],
  templateUrl: './purchase-income-form.component.html',
  styleUrl: './purchase-income-form.component.scss'
})
export class PurchaseIncomeFormComponent {

  // private formServ = inject(OtherIncomeFormService)
  // formState = this.formServ.state
  // update = this.formServ.updator

  // private modalService = inject(NgbModal)
  // private searchProductModal = viewChild('searchProductModal')
  // openSearchProduct() {
  //   const ref = this.modalService.open(this.searchProductModal())
  // }
  // currentProduct = computed(() => this.formState().productList)
  // private setProductList = this.update('productList')
  // private productIdSet = new Set<string>()
  // onSelectProduct(products: TOIProduct[]) {
  //   const validProduct = products.flatMap((p) => {
  //     const hasValue = this.productIdSet.has(p.goodCode)
  //     if (hasValue) return []
  //     this.productIdSet.add(p.goodCode)
  //     return [p]
  //   })
  //   const currentProduct = this.currentProduct()
  //   const newProduct = [...currentProduct, ...validProduct]
  //   this.setProductList(newProduct)
  //   this.modalService.dismissAll()
  // }
  // onRemoveProduct(goodCode: string) {
  //   const currentProduct = this.currentProduct()
  //   const newProduct = currentProduct.filter((p) => p.goodCode !== goodCode)
  //   this.setProductList(newProduct)
  //   this.productIdSet.delete(goodCode)
  // }

  // private searchSupplierModal = viewChild('searchSupplierModal')
  // openSearchSupplier() {
  //   const ref = this.modalService.open(this.searchSupplierModal())
  // }
  // selectComp({ compCode, compName }: TComp) {
  //   this.setProductList([])
  //   this.formServ.updateMany({ compCode, compName })
  //   this.modalService.dismissAll()
  // }
  // notSelectComp = this.formServ.notSelectComp

  // endPoint = computed(() => this.event() !== 0 ? '/other-income/purchase/create-1' : '/other-income/purchase')
  // endPointDisable = computed(() => this.invalidEvent() || this.invalidDiscountType() || this.invalidPeriod() ? 'btn btn-success disabled' : 'btn btn-success')

  private baseFormService = inject(OiBaseformService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  onSubmit = () => {
    this.baseFormService.createHead().subscribe(
      {
        next: ({ id }) => {
          this.baseFormService.resetForm()
          this.router.navigate([id], { relativeTo: this.route })
        },
        error: (err) => {
          console.log(err)
        },
      }
    )
  }
}

type TStepItem = {
  start: number
  percent: number
}

type TComp = {
  compCode: string
  compName: string
}