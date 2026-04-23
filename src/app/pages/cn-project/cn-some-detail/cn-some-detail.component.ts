import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseSubmitCn } from '../../../lib/cn';
import { GoodItemComponent } from '../../../components/cn/good-item/good-item.component';
import { LotItemComponent } from '../../../components/cn/lot-item/lot-item.component';
import { UploaderComponent } from '../../../components/uploader/uploader.component';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-cn-some-detail',
  imports: [GoodItemComponent, LotItemComponent, RouterLink, UploaderComponent, DecimalPipe],
  templateUrl: './cn-some-detail.component.html',
  styleUrl: './cn-some-detail.component.scss'
})
export class CnSomeDetailComponent extends BaseSubmitCn implements OnInit, OnDestroy {
  ngOnInit(): void {
    this.getUrl()
  }

  ngOnDestroy(): void {
    this.unsub()
  }
  selected = this.orderServ.selectItem
  cnt = this.orderServ.totalCnt
  handleCheckItem = this.orderServ.handleCheckLot
  handleCheckAdded = this.orderServ.handleCheckLotAdded
  added = this.orderServ.selectAddedItem
  override goodList = this.orderServ.selectedLotItem;
  override totalprice = this.orderServ.selectedSubtotal
  disableUplaod = computed(() =>
    this.remarkServ.invalidRemarkOpt()
    || this.remarkServ.cnType() !== 'some'
    || this.orderServ.invalidByGoodReuturnAmou()
  )

  override disable = computed(() =>
    this.imageServ.invalidImage() || this.disableUplaod()
  )

}
