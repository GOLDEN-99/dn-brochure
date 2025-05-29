import { Component, computed, input } from '@angular/core';
import { TFlashSaleItem } from '../../../types';

@Component({
  selector: 'app-flash-sale-card',
  imports: [],
  templateUrl: './flash-sale-card.component.html',
  styleUrl: './flash-sale-card.component.scss'
})
export class FlashSaleCardComponent {
  cardProp = input.required<TFlashSaleItem>()

  imgUrl = computed(() => `https://file.drugnetcenter.com/drugpos/GoodPictures/${this.cardProp().goodCode}.jpg`)

  textClass = computed(() => this.cardProp().goodName.length > 30 ? 'header-text text-white long' : 'header-text text-white')
}
