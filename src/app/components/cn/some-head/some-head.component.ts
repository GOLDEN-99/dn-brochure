import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TAppGoodItem } from '../../../types/cn.type';
import { CnOrderService } from '../../../service/cn/cn-order/cn-order.service';

@Component({
  selector: 'app-some-head',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './some-head.component.html',
  styleUrl: './some-head.component.scss'
})
export class SomeHeadComponent {
  private orderServ = inject(CnOrderService)

  orderList = this.orderServ.itemList
  addedList = this.orderServ.addedItem
  cnt = this.orderServ.totalCnt
  selectItem(idx: number, check: boolean) {
    this.orderServ.handleSelect(idx, check)
  }

  removeItem(barCode: string) {
    this.orderServ.addedItem.update(prev => prev.filter(p => p.barCode !== barCode))
  }

  selectItemAdded(idx: number, check: boolean) {
    this.orderServ.handleSelectAdded(idx, check)
  }
}
