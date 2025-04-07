import { Component, inject, Input, input, model, output } from '@angular/core';
import { TAppLot, TLotItem } from '../../../types/cn.type';
import { FormsModule } from '@angular/forms';
import { CnOrderService } from '../../../service/cn/cn-order/cn-order.service';


@Component({
  selector: 'app-lot-item',
  imports: [FormsModule],
  templateUrl: './lot-item.component.html',
  styleUrl: './lot-item.component.scss'
})
export class LotItemComponent {
  lotItem = input.required<TAppLot>()
  private orderServ = inject(CnOrderService)
  baseHandler = this.orderServ.handleCheckLot

  check = output<boolean>()
  amount = output<number>()

  onCheck(check: boolean) {
    console.log(check)
    this.check.emit(check)
    // const { lotNumber, goodCode, expiDate } = this.lotItem()
    // const handleCheck = this.baseHandler(goodCode, { lotNumber, expiDate })
    // handleCheck({ check })
  }

  onChange(goodAmou: number) {
    this.amount.emit(goodAmou)
    // const { lotNumber, goodCode, expiDate } = this.lotItem()
    // const handleChange = this.baseHandler(goodCode, { lotNumber, expiDate })
    // handleChange({ goodAmou })
  }

}
