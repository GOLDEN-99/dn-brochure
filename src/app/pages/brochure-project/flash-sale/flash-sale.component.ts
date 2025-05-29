import { Component } from '@angular/core';
import { FlashSaleCardComponent } from "../../../components/brochure-card/flash-sale-card/flash-sale-card.component";
import { transformItemList } from '../../../lib';

@Component({
  selector: 'app-flash-sale',
  imports: [FlashSaleCardComponent],
  templateUrl: './flash-sale.component.html',
  styleUrl: './flash-sale.component.scss'
})
export class FlashSaleComponent {
  ref = [1, 2, 3, 4, 5]

  formattedRef = this.ref.reduce<number[][]>(transformItemList(3), [])

  genRow = (len: number) => len === 3 ? 'flash-sale-row row-3' : 'flash-sale-row row-2'
}
