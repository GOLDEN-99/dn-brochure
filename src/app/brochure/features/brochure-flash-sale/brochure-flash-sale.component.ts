import { Component, computed, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { TFlashSaleHead, TFlashSaleItem } from '../../types/brochure.type';
import { FlashSaleCardComponent } from "../../../components/brochure-card/flash-sale-card/flash-sale-card.component";
import { formatThaiDateRangeShort, inclusiveDayCount } from '../../../lib/brochure/thai-date';

/** The background is a fixed project asset, not a per-promotion upload.
 *  The `linkimg` field is no longer read — see
 *  docs/brochure-restyle/FLASH-SALE-ASSET-LIST.md §6.2.
 *  Until the design team delivers the 4160x4160 plate this file is absent and
 *  the page falls back to the CSS gradient in the stylesheet. */
const FS_BACKGROUND = '/image/FS/bg.jpg'

@Component({
  selector: 'brochure-flash-sale',
  imports: [FlashSaleCardComponent],
  templateUrl: './brochure-flash-sale.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './brochure-flash-sale.component.scss',
  /* `flash-sale-bg flash-sale-page main-gap` are kept purely as the export
     contract: brochure-flash-sale-page.component.ts finds the hidden 4160px
     node with
       querySelector('.flash-sale-bg.flash-sale-page.main-gap.static')
     and returns silently when it matches nothing. Renaming these breaks export
     with no error shown. */
  host: {
    'class': 'flash-sale-bg flash-sale-page main-gap',
    '[class.static]': 'isStatic()',
  },
})
export class BrochureFlashSaleComponent {

  head = input.required<TFlashSaleHead>()

  items = input.required<TFlashSaleItem[]>()

  isStatic = input<boolean>(true)

  readonly backgroundUrl = FS_BACKGROUND

  backgroundMissing = signal(false)

  /** The day count is rendered as text, so there is no plate to run out of and
   *  no ceiling. The old code picked an image per day and clamped with
   *  Math.min(day, 9), which printed "9 วันเท่านั้น" on a 14-day promotion.
   *  Promotion length is set by a team that defines no maximum, so any number
   *  has to render. */
  dayCount = computed(() => {
    const head = this.head()
    if (head?.day && head.day > 0) return head.day
    return inclusiveDayCount(head?.fromDate, head?.toDate)
  })

  dateRange = computed(() => {
    const head = this.head()
    return formatThaiDateRangeShort(head?.fromDate, head?.toDate)
  })
}
