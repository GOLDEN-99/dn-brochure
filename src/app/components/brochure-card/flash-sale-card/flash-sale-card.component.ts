import { Component, computed, input, signal } from '@angular/core';
import { TFlashSaleItem } from '../../../types';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-flash-sale-card',
  imports: [DecimalPipe],
  templateUrl: './flash-sale-card.component.html',
  styleUrl: './flash-sale-card.component.scss'
})
export class FlashSaleCardComponent {
  cardProp = input.required<TFlashSaleItem>()

  imgUrl = computed(() => `https://file.drugnetcenter.com/drugpos/GoodPictures/${this.cardProp().goodCode}.jpg`)

  textClass = computed(() => {
    const stat = this.isStatic()
    if (stat) {
      return this.cardProp().goodName.length > 30 ? 'header-text text-white long static' : 'header-text text-white static'
    }
    return this.cardProp().goodName.length > 30 ? 'header-text text-white long' : 'header-text text-white'
  }
  )

  isStatic = input<boolean>(true)

  headerClass = computed(() => this.isStatic() ? 'header static' : 'header')

  contentClass = computed(() => this.isStatic() ? 'content static' : 'content')

  priceTextClass = computed(() => this.isStatic() ? 'price-text static text-white' : 'price-text text-white')

  goodCodeClass = computed(() => this.isStatic() ? 'goodcode static' : 'goodcode')
}
