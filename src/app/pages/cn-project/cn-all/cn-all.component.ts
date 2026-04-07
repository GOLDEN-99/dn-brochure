import { Component, computed, input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { BaseSubmitCn } from '../../../lib/cn';
import { UploaderComponent } from '../../../components/uploader/uploader.component';


@Component({
  selector: 'app-cn-all',
  imports: [UploaderComponent, RouterLink, DecimalPipe],
  templateUrl: './cn-all.component.html',
  styleUrl: './cn-all.component.scss'
})
export class CnAllComponent extends BaseSubmitCn implements OnInit, OnDestroy {
  ngOnInit(): void {
    this.getUrl()
  }

  ngOnDestroy(): void {
    this.unsub()
  }
  override goodList = this.orderServ.wholeBillItem
  override totalprice = this.orderServ.wholeBillSubtotal
  override disable = computed(() =>
    this.imageServ.invalidImage()
    || this.totalprice() === 0
    || this.remarkServ.cnType() !== 'whole'
    || this.orderServ.previousCNCount() > 0
  )

  alterText = computed(() => {
    const prev = this.orderServ.previousCNCount()
    if (prev > 0) return `เคย cn ไปแล้ว ${prev} ครั้ง`
    return ""
  }
  )

}
