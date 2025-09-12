import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalLayoutComponent } from "../../../components/modal/modal-layout/modal-layout.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import { ApiService } from '../../../service/api/api.service';
import { environment } from '../../../../environments/environment';
import { getOrElse } from '../../../lib/utli';
import { SupplierFromService } from '../../../service/supplier/supplier-from.service';

@Component({
  selector: 'app-supplier-product-page',
  imports: [FormsModule, ModalLayoutComponent],
  templateUrl: './supplier-product-page.component.html',
  styleUrl: './supplier-product-page.component.scss'
})
export class SupplierProductPageComponent {
  private productModal = viewChild('productModal')
  private modalService = inject(NgbModal)
  openProductModal = () => this.modalService.open(this.productModal(), {})

  goodName = signal("")
  barcode = signal("")
  goodName$ = toObservable(this.goodName).pipe(distinctUntilChanged(), debounceTime(300))
  barcode$ = toObservable(this.barcode).pipe(distinctUntilChanged(), debounceTime(300))
  private param$ = combineLatest([this.goodName$, this.barcode$])
    .pipe(
      map(([goodName, barcode]) => ({ goodName, barcode })),
      filter(({ goodName, barcode }) => goodName !== '' || barcode !== '')
    )
  private api = inject(ApiService)
  private url = `${environment.oi}/products`
  private searchProduct = (params: { goodName: string, barcode: string }) =>
    this.api.get<TBaseProduct[]>(this.url, { params }).pipe(getOrElse<TBaseProduct[]>([]))
  private data$ = this.param$.pipe(
    switchMap((params) => this.searchProduct(params)),
    getOrElse<TBaseProduct[]>([]),
  )
  displayProduct = toSignal(this.data$, { initialValue: [] })

  private formServ = inject(SupplierFromService)
  itemList = this.formServ.item
  updateItem = this.formServ.updateItem
  formState = this.formServ.formState
  condition = computed(() => {
    const {
      supReturn, supFullBox, supSameLot, supMonthAfterExp, supMonthBeforeExp,
      stkReturn, stkFullBox, stkSameLot, stkMonthAfterExp, stkMonthBeforeExp,
    } = this.formState()
    return {
      supReturn, supFullBox, supSameLot, supMonthAfterExp, supMonthBeforeExp,
      stkReturn, stkFullBox, stkSameLot, stkMonthAfterExp, stkMonthBeforeExp,
    }
  })
  addItem = (product: TBaseProduct) => {
    const prev = this.itemList()
    const occurence = prev.findIndex(p => p.barCode === product.barCode)
    if (occurence !== -1) return
    const cond = this.condition()
    this.itemList.update(prev => [...prev, { ...product, isShipTo: false, ...cond }])
  }

  onAddItem(product: TBaseProduct) {
    this.addItem(product)
    this.modalService.dismissAll()
  }

  onSetDefault() {
    const cond = this.condition()
    this.itemList.update(prev => prev.map(p => ({ ...p, ...cond })))
  }

  getDangerStyle(goodStat: boolean) {
    return goodStat ? '' : 'text-danger'
  }
}

type TBaseProduct = {
  goodCode: string
  goodName: string
  barCode: string
  goodStat: boolean
}

type AppProduct = {
  "goodCode": "string",
  "goodName": "string",
  "goodStat": "string",
  "isShipTo": "string",
  "supReturn": "string",
  "supMonthBeforeExp": "string",
  "supMonthAfterExp": "string",
  "supFullBox": "string",
  "supSameLot": "string",
  "stkReturn": "string",
  "stkFullBox": "string",
  "stkSameLot": "string",
  "stkMonthBeforeExp": "string",
  "stkMonthAfterExp": "string"
} & TBaseProduct