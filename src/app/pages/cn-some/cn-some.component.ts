import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CnOrderService } from '../../service/cn/cn-order/cn-order.service';
import { SomeHeadComponent } from "../../components/cn/some-head/some-head.component";
import { SearchProductComponent } from "../../components/cn/search-product/search-product.component";

@Component({
  selector: 'app-cn-some',
  imports: [RouterLink, SomeHeadComponent, SearchProductComponent],
  templateUrl: './cn-some.component.html',
  styleUrl: './cn-some.component.scss'
})
export class CnSomeComponent {
  private orderServ = inject(CnOrderService)
  cnt = this.orderServ.totalCnt
  orderList = this.orderServ.itemList
}
