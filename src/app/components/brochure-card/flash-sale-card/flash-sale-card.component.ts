import { Component, computed, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { TFlashSaleItem } from '../../../types';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-flash-sale-card',
  imports: [DecimalPipe],
  templateUrl: './flash-sale-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './flash-sale-card.component.scss',
  host: { '[class.static]': 'isStatic()' },
})
export class FlashSaleCardComponent {
  cardProp = input.required<TFlashSaleItem>()

  isStatic = input<boolean>(true)

  imgUrl = computed(() => `https://file.drugnetcenter.com/drugpos/GoodPictures/${this.cardProp().goodCode}.jpg`)

  /** a product with no picture on file leaves the slot empty rather than
   *  baking a broken-image glyph into the exported JPG */
  imgFailed = signal(false)

  /** Contains the photo inside its slot by hand.
   *  object-fit is not used: html2canvas 1.4.1 does not reproduce it reliably
   *  and the exported JPG is the deliverable, so the fit is resolved to
   *  explicit pixels the rasteriser cannot disagree with.
   *  Measuring the slot rather than using a fixed cap keeps the photo as large
   *  as the card allows in both modes; .fs-photo also carries max-width /
   *  max-height so a photo can never overflow if this never runs. */
  handleOnLoad(e: Event) {
    const img = e.target as HTMLImageElement
    const slot = img.parentElement
    if (!img.naturalWidth || !img.naturalHeight) return

    const box = slot?.getBoundingClientRect()
    const limitW = box?.width || (this.isStatic() ? 1100 : 300)
    const limitH = box?.height || (this.isStatic() ? 700 : 190)

    const scale = Math.min(limitW / img.naturalWidth, limitH / img.naturalHeight)
    img.style.width = `${Math.round(img.naturalWidth * scale)}px`
    img.style.height = `${Math.round(img.naturalHeight * scale)}px`
  }
}
