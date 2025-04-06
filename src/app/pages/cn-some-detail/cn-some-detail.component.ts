import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GoodItemComponent } from '../../components/cn/good-item/good-item.component';
import { CnOrderService } from '../../service/cn/cn-order/cn-order.service';
import { LotItemComponent } from '../../components/cn/lot-item/lot-item.component';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cn-some-detail',
  imports: [GoodItemComponent, LotItemComponent, RouterLink, UploaderComponent, DecimalPipe],
  templateUrl: './cn-some-detail.component.html',
  styleUrl: './cn-some-detail.component.scss'
})
export class CnSomeDetailComponent {
  private orderServ = inject(CnOrderService)
  selected = this.orderServ.selectItem
  cnt = this.orderServ.totalCnt
  handleCheckItem = this.orderServ.handleCheckLot
  handleCheckAdded = this.orderServ.handleCheckLotAdded
  added = this.orderServ.selectAddedItem
  onClick() {
    console.log(this.orderServ.selectedLot())
  }
}
