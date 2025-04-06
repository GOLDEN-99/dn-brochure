import { Component, input } from '@angular/core';
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
}
