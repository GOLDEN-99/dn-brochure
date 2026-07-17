import { Component, computed, input } from '@angular/core';
import { TFlashSaleItem } from '../../types/brochure.type';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'brochure-flash-sale-card',
  imports: [DecimalPipe],
  templateUrl: './brochure-flash-sale-card.component.html',
  styleUrl: './brochure-flash-sale-card.component.scss',
})
export class BrochureFlashSaleCardComponent {
  cardProp = input.required<TFlashSaleItem>()

  imgUrl = computed(() => `https://file.drugnetcenter.com/drugpos/GoodPictures/${this.cardProp().goodCode}.jpg`)

  textClass = computed(() => {
    const stat = this.isStatic()
    if (stat) {
      return 'header-text text-white static'
    }
    return 'header-text text-white'
  }
  )

  isStatic = input<boolean>(true)

  headerClass = computed(() => this.isStatic() ? 'header static' : 'header')

  contentClass = computed(() => this.isStatic() ? 'content static' : 'content')

  priceTextClass = computed(() => this.isStatic() ? 'price-text static text-white' : 'price-text text-white')

  goodCodeClass = computed(() => this.isStatic() ? 'goodcode static' : 'goodcode')

  headerContainer = computed(() => this.isStatic() ? 'height:35%;' : 'height:25%;')

  handleOnLoad(e: any) {
    const containerRatio = 0.8
    const img = e.target as HTMLImageElement
    const ratio = img.naturalWidth / img.naturalHeight
    if (ratio < containerRatio) {
      img.style.height = '730px'
    } else {
      img.style.width = '590px'
    }
  }
}
