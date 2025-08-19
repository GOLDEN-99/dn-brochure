import { Component, computed, effect, input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseSubmitCn } from '../../../lib/cn';
import { GoodItemComponent } from '../../../components/cn/good-item/good-item.component';
import { LotItemComponent } from '../../../components/cn/lot-item/lot-item.component';
import { UploaderComponent } from '../../../components/uploader/uploader.component';
import { DecimalPipe } from '@angular/common';
import { TAppGoodItem } from '../../../types/cn.type';

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
  mappedSelected = computed(() => this.selected().flatMap(
    ({ lot, ...res }) =>
      lot.flatMap(
        ({ check, ...l }) => check ? [({ ...l, ...res })] : [])
  ))
  invalidSelected = computed(() => this.mappedSelected().some(({ returnAmou }) => returnAmou === 0))
  cnt = this.orderServ.totalCnt
  handleCheckItem = this.orderServ.handleCheckLot
  handleCheckAdded = this.orderServ.handleCheckLotAdded
  added = this.orderServ.selectAddedItem
  override goodList = this.orderServ.selectedLotItem;
  override totalprice = this.orderServ.selectedSubtotal
  override disable = computed(() =>
    this.imageServ.invalidImage()
    || this.remarkServ.invalidRemarkOpt()
    || this.remarkServ.cnType() !== 'some'
    || this.orderServ.invalidByGoodReuturnAmou()
    || this.invalidSelected()
  )
}
