import { Component, computed, input } from '@angular/core';
import { TAppGoodItem, TGoodItem } from '../../../types/cn.type';
import { LotItemComponent } from '../lot-item/lot-item.component';

@Component({
  selector: 'app-good-item',
  imports: [],
  templateUrl: './good-item.component.html',
  styleUrl: './good-item.component.scss'
})
export class GoodItemComponent {
  item = input.required<TAppGoodItem>()
  invalid = computed(() => {
    const { useItem, goodCode, lot } = this.item()
    const totalCnItem = lot.reduce((acc, { check, returnAmou }) => check ? acc + returnAmou : acc, 0)
    const totalItem = lot.reduce((acc, { goodAmou }) => acc + goodAmou, 0)
    console.log(goodCode)
    console.log(useItem)
    console.log(totalCnItem)
    console.log(totalItem)
    const res = totalItem < totalCnItem + useItem
    console.log(res)
    return res
  })

  // invalidClass = computed(() => this.invalid()
  //   ? 'good-item border-bottom bg-danger'
  //   : 'good-item border-bottom'
  // )
}
