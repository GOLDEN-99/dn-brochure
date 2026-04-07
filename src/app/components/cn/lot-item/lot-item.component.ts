import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TAppLot } from '../../../types/cn.type';
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
  private readonly orderServ = inject(CnOrderService)
  baseHandler = this.orderServ.handleCheckLot

  check = output<boolean>()
  amount = output<number>()

  onCheck(check: boolean) {
    this.check.emit(check)
  }

  onChange(goodAmou: number) {
    this.touch.set(true)
    const maxValue = this.maxValue()
    if (goodAmou < 1) {
      this.invalid.set(true)
      return
    }
    if (!this.hasMaximum()) {
      this.amount.emit(goodAmou)
      this.invalid.set(false)
      return
    }
    if (goodAmou > maxValue) {
      this.invalid.set(true)
      return
    }
    this.amount.emit(goodAmou)
    this.invalid.set(false)
  }
  hasMaximum = input(true)
  maxValue = computed(() => {
    const max = this.lotItem().goodAmou;
    return this.hasMaximum()
      ? max
      : 500
  })
  touch = signal(false)
  invalid = signal(false)
  invalidInput = computed(() => {
    const min = 1
    const max = this.maxValue()
    const curAmount = this.lotItem().returnAmou
    return curAmount < min || curAmount > max || this.invalid()
  })
  invalidClass = computed(() => {
    if (!this.touch()) return 'form-control'
    return this.invalidInput()
      ? 'form-control is-invalid'
      : 'form-control is-valid'
  })
  maximumItemCount = computed(() => this.lotItem().goodAmou)
}
