import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TAppGoodItem } from '../../../types/cn.type';
import { CnOrderService } from '../../../service/cn/cn-order/cn-order.service';
import { SearchBarcodeService } from '../../../service/cn/search-barcode/search-barcode.service';

@Component({
  selector: 'app-search-product',
  imports: [FormsModule],
  templateUrl: './search-product.component.html',
  styleUrl: './search-product.component.scss'
})
export class SearchProductComponent {
  private readonly orderServ = inject(CnOrderService)
  private readonly searchService = inject(SearchBarcodeService)
  onSearch = this.searchService.onSearch
  search = this.searchService.search
  private readonly productRef = computed(() => new Set(this.orderServ.totalItem().map(o => o.goodCode)))
  productList = computed(() => {
    const ref = this.productRef()
    return this.searchService.products().filter(p => !ref.has(p.goodCode))
  }
  )
  addItem(item: TAppGoodItem) {
    this.orderServ.addedItem.update(prev => [...prev, item])
  }
}
