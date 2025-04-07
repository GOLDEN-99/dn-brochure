import { Component, inject } from '@angular/core';
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
  private orderServ = inject(CnOrderService)
  private searchService = inject(SearchBarcodeService)
  onSearch = this.searchService.onSearch
  search = this.searchService.search
  productList = this.searchService.products

  addItem(item: TAppGoodItem) {
    this.orderServ.addedItem.update(prev => [...prev, item])
  }
}
