import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbCalendar, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateInputComponent } from "../../../../components/date-input/date-input.component";
import { SearchProductModalComponent } from '../../../../components/other-income/search-product-modal/search-product-modal.component';
import { DiscountSubformComponent } from "../../../../components/other-income/form/discount-subform/discount-subform.component";
import { TargetSubformComponent } from "../../../../components/other-income/form/target-subform/target-subform.component";
import { LimitSubformComponent } from "../../../../components/other-income/form/limit-subform/limit-subform.component";
import { SearchSupplierComponent } from "../../../../components/inbound-outbound/search-supplier/search-supplier.component";
import { OtherIncomeModalComponent } from "../../../../components/other-income/other-income-modal/other-income-modal.component";
import { OtherSearchSupplierModalComponent } from "../../../../components/other-income/other-search-supplier-modal/other-search-supplier-modal.component";

@Component({
  selector: 'app-purchase-income-form',
  imports: [FormsModule, NgbDatepickerModule, RouterLink, DateInputComponent, SearchProductModalComponent, DiscountSubformComponent, TargetSubformComponent, LimitSubformComponent, SearchSupplierComponent, OtherIncomeModalComponent, OtherSearchSupplierModalComponent],
  templateUrl: './purchase-income-form.component.html',
  styleUrl: './purchase-income-form.component.scss'
})
export class PurchaseIncomeFormComponent {
  compCode = signal("")
  compName = signal("")
  selectComp({ compCode, compName }: TComp) {
    this.productList.update(() => [])
    this.compCode.update(() => compCode)
    this.compName.update(() => compName)
    this.modalService.dismissAll()
  }
  notSelectComp = computed(() => this.compCode() === '' || this.compName() === '')

  incVat = signal<boolean>(false)

  discount = signal(false)
  discountType = signal(0)

  target = signal(0)
  percent = signal(0)
  invalidPercentTarget = computed(() => this.target() === 1 && this.percent() === 0)

  period = signal(0)

  limit = signal(false)
  limitAmount = signal(0)
  invalidLimitAmount = computed(() => this.limit() && this.limitAmount() === 0)

  calendar = inject(NgbCalendar);
  fromDate = signal(this.calendar.getToday())
  toDate = signal(this.calendar.getToday())

  step = signal<TStepItem[]>([{ start: 0, percent: 0 }])
  productList = signal<TProduct[]>([])
  private modalService = inject(NgbModal)
  private searchProductModal = viewChild('searchProductModal')
  openSearchProduct() {
    const ref = this.modalService.open(this.searchProductModal())
  }

  private productIdSet = new Set<number>()
  onSelectProduct(products: TProduct[]) {
    const validProduct = products.flatMap((p) => {
      const hasValue = this.productIdSet.has(p.id)
      if (hasValue) return []
      this.productIdSet.add(p.id)
      return [p]
    })
    this.productList.update((p) => [...p, ...validProduct])
    this.modalService.dismissAll()
  }
  onRemoveProduct(id: number) {
    this.productList.update(p => p.filter((p) => p.id !== id))
    this.productIdSet.delete(id)
  }

  private searchSupplierModal = viewChild('searchSupplierModal')
  openSearchSupplier() {
    const ref = this.modalService.open(this.searchSupplierModal())
  }
}

type TStepItem = {
  start: number
  percent: number
}
type TProduct = { name: string, check: boolean, id: number }
type TComp = {
  compCode: string
  compName: string
}