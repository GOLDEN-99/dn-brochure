import { Component, computed, inject } from '@angular/core';
import { FlashSaleCardComponent } from "../../../components/brochure-card/flash-sale-card/flash-sale-card.component";
import { transformItemList } from '../../../lib';
import { FlashSaleService } from '../../../service/brochure/flash-sale/flash-sale.service';

@Component({
  selector: 'app-flash-sale',
  imports: [FlashSaleCardComponent],
  templateUrl: './flash-sale.component.html',
  styleUrl: './flash-sale.component.scss'
})
export class FlashSaleComponent {
  ref = [1, 2, 3, 4, 5]

  formattedRef = this.ref.reduce<number[][]>(transformItemList(3), [])

  private flashSaleServ = inject(FlashSaleService)

  genRow = (len: number) => len === 3 ? 'flash-sale-row row-3' : 'flash-sale-row row-2'

  listItem = this.flashSaleServ.list

  head = this.flashSaleServ.head

  dayImg = computed(() => {
    const day = this.head()?.day
    if (!day) return 1
    return day < 10 ? day : 1
  })
}
