import { Component, computed, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { TFlashSaleItem } from '../../../types';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { FlashSaleSlot } from '../../../lib/brochure/flash-sale-layout';

@Component({
  selector: 'app-flash-sale-card',
  imports: [DecimalPipe],
  templateUrl: './flash-sale-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './flash-sale-card.component.scss',
  host: {
    '[style.left]': 'slot().left',
    '[style.top]': 'slot().top',
    '[style.width]': 'slot().width',
  },
})
export class FlashSaleCardComponent {
  cardProp = input.required<TFlashSaleItem>()

  /** position and size come from the page's layout table */
  slot = input.required<FlashSaleSlot>()

  /** the other four brochure cards all resolve the picture host this way */
  imgUrl = computed(() => `${environment.imagePath}/${this.cardProp().goodCode}.jpg`)

  /** a product with no picture on file leaves the slot empty rather than
   *  baking a broken-image glyph into the exported JPG */
  imgFailed = signal(false)

  /** Contains the photo inside its slot by hand.
   *  object-fit is not used: html2canvas 1.4.1 does not reproduce it reliably
   *  and the exported JPG is the deliverable, so the fit is resolved to
   *  explicit pixels the rasteriser cannot disagree with. */
  handleOnLoad(e: Event) {
    const img = e.target as HTMLImageElement
    if (!img.naturalWidth || !img.naturalHeight) return

    const box = img.parentElement?.getBoundingClientRect()
    if (!box?.width || !box?.height) return

    const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight)
    img.style.width = `${Math.round(img.naturalWidth * scale)}px`
    img.style.height = `${Math.round(img.naturalHeight * scale)}px`
  }
}
