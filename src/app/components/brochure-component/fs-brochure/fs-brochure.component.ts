import { Component, computed, input } from '@angular/core';
import { FlashSaleCardComponent } from '../../brochure-card/flash-sale-card/flash-sale-card.component';
import { TFlashSaleHead, TFlashSaleItem } from '../../../types';

@Component({
  selector: 'app-fs-brochure',
  imports: [FlashSaleCardComponent],
  templateUrl: './fs-brochure.component.html',
  styleUrl: './fs-brochure.component.scss'
})
export class FsBrochureComponent {

  genRow = (len: number) => len === 3 ? 'flash-sale-row row-3' : 'flash-sale-row row-2'

  head = input.required<TFlashSaleHead>()

  items = input.required<TFlashSaleItem[]>()

  isStatic = input<boolean>(true)

  dayImg = computed(() => {
    const day = this.head()?.day
    if (!day) return 5
    return Math.min(day, 9)
  })

  dayActive = computed(() => this.head().dayActive)


  mainClass = computed(() => this.isStatic() ? 'flash-sale-bg flash-sale-page main-gap static' : 'flash-sale-bg flash-sale-page container main-gap')

  headClass = computed(() => this.isStatic() ? 'head-space static' : 'head-space')

  plainTextClass = computed(() => this.isStatic() ? 'plain-day-text text-white static' : 'plain-day-text text-white')

  dayTextClass = computed(() => this.isStatic() ? 'day-text text-white static' : 'day-text text-white')

  fsLayoutClass = computed(() => this.isStatic() ? 'flash-sale-layout main-gap static' : 'flash-sale-layout main-gap')

  fsHeadClass = computed(() => this.isStatic() ? 'flash-sale-head static' : 'flash-sale-head')

  bgUrl = computed(() => this.head().linkimg)
}