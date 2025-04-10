import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TAppLot, TLotItem } from '../../../types/cn.type';
import { FormBuilder, FormsModule } from '@angular/forms';
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
    this.check.emit(check)
  }

  onChange(goodAmou: number) {
    this.touch.set(true)
    if (goodAmou < 1) {
      this.amount.emit(0)
      return
    }
    this.amount.emit(goodAmou)
  }
  hasMaximum = input(true)
  maxValue = computed(() => {
    const max = this.lotItem().goodAmou;
    return this.hasMaximum()
      ? max
      : 100
  })
  touch = signal(false)
  invalidInput = computed(() => {
    const min = 1
    const max = this.maxValue()
    const curAmount = this.lotItem().returnAmou
    return curAmount < min
      || curAmount > max
  })
  invalidClass = computed(() => {
    if (!this.touch()) return 'form-control'
    return this.invalidInput()
      ? 'form-control is-invalid'
      : 'form-control is-valid'
  })
  handleInput(event: Event) {
    const input = event.target as HTMLInputElement
    const value = parseInt(input.value)
    const max = this.maxValue()
    if (isNaN(value)) return
    this.touch.set(true)
    if (value < 1) {
      input.value = '0'
      return
    }
    if (value > max) {
      input.value = String(max)
      return
    }
  }
}
