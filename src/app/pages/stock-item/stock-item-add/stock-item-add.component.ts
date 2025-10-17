import { Component, computed, inject, signal } from '@angular/core';
import { StockItemApiService } from '../../../service/stock-item/stock-item-api.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TMaybe } from '../../../types';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';


@Component({
  selector: 'app-stock-item-add',
  imports: [FormsModule],
  templateUrl: './stock-item-add.component.html',
  styleUrl: './stock-item-add.component.scss'
})
export class StockItemAddComponent {
  private stockItemServ = inject(StockItemApiService)
  private modalServ = inject(NgbModal)
  modeList = [{ key: "goodCode", label: 'รหัสสินค้า' }, { key: "goodName", label: "ชื่อสินค้า" }]
  mode = signal("goodCode")
  onModeChange = (mode: string) => {
    this.mode.set(mode);
    this.stockItemServ.resetSearch();
  }
  isCode = signal(() => this.mode() === "goodCode")

  openSearchProductModal = (ref: any) => {
    this.modalServ.open(ref, { size: 'lg' });
  }
  search = this.stockItemServ.searchProductTerm
  searchName = (goodName: string) => this.search.update(prev => ({ ...prev, goodName }))
  searchCode = (goodCode: string) => this.search.update(prev => ({ ...prev, goodCode }))
  productList = this.stockItemServ.searchProductResult

  selectedProduct = signal<TMaybe<TBaseProduct>>(null)
  private selectedCode = computed(() => this.selectedProduct()?.goodCode ?? "")
  private selectedCode$ = toObservable(this.selectedCode)
  private gp$ = this.selectedCode$.pipe(switchMap(c => this.stockItemServ.getGoodGP(c)), tap((res) => res !== null && this.dnCost.set(res.dnCost)))
  gp = toSignal(this.gp$, { initialValue: null })
  onAddProduct(product: TBaseProduct) {
    this.selectedProduct.set(product);
    this.modalServ.dismissAll();
    this.stockItemServ.resetSearch();
  }
  dnCost = signal(0)
  newCost = signal(0)
}

type TBaseProduct = {
  goodCode: string
  goodName: string
  barCode: string
  goodStat: boolean
}
