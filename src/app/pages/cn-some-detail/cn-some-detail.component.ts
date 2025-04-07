import { Component, computed, signal, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GoodItemComponent } from '../../components/cn/good-item/good-item.component';
import { LotItemComponent } from '../../components/cn/lot-item/lot-item.component';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { DecimalPipe } from '@angular/common';
import { BaseSubmitCn } from '../../lib/cn';
import { TGoodItemReq } from '../../types/cn.type';

@Component({
  selector: 'app-cn-some-detail',
  imports: [GoodItemComponent, LotItemComponent, RouterLink, UploaderComponent, DecimalPipe],
  templateUrl: './cn-some-detail.component.html',
  styleUrl: './cn-some-detail.component.scss'
})
export class CnSomeDetailComponent extends BaseSubmitCn {
  selected = this.orderServ.selectItem
  cnt = this.orderServ.totalCnt
  handleCheckItem = this.orderServ.handleCheckLot
  handleCheckAdded = this.orderServ.handleCheckLotAdded
  added = this.orderServ.selectAddedItem
  override goodList: Signal<TGoodItemReq[]> = this.orderServ.selectedLotItem;
  override totalprice = this.orderServ.selectedSubtotal
  override disable: Signal<boolean> = computed(() =>
    this.image().length === 0
    || this.totalprice() === 0
    || this.remarkServ.prependReq().motiveId === '0'
  )
}
