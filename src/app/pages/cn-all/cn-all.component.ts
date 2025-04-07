import { Component, computed } from '@angular/core';
import { UploaderComponent } from "../../components/uploader/uploader.component";
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { BaseSubmitCn } from '../../lib/cn';

@Component({
  selector: 'app-cn-all',
  imports: [UploaderComponent, RouterLink, DecimalPipe],
  templateUrl: './cn-all.component.html',
  styleUrl: './cn-all.component.scss'
})
export class CnAllComponent extends BaseSubmitCn {

  override goodList = this.orderServ.wholeBillItem
  override totalprice = this.orderServ.wholeBillSubtotal
  override disable = computed(() =>
    this.imageServ.noFile() || this.totalprice() === 0
  )

}
