import { Component, computed, input } from '@angular/core';
import { TAppGoodItem } from '../../../types/cn.type';

@Component({
  selector: 'app-good-item',
  imports: [],
  templateUrl: './good-item.component.html',
  styleUrl: './good-item.component.scss'
})
export class GoodItemComponent {
  notCheck = input(false)
  item = input.required<TAppGoodItem>()
  invalid = computed(() => {
    if (this.notCheck()) return false
    const { useItem, lot } = this.item()
    const totalCnItem = lot.reduce((acc, { check, returnAmou }) => check ? acc + returnAmou : acc, 0)
    const totalItem = lot.reduce((acc, { goodAmou }) => acc + goodAmou, 0)
    return totalItem < totalCnItem + useItem
  })

  invalidClass = computed(
    () => this.invalid()
      ? 'good-item border-bottom bg-danger'
      : 'good-item border-bottom'
  )
}
