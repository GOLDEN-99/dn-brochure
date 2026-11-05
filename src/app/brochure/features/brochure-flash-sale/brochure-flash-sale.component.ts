import {
  Component, computed, input, signal, viewChild, ElementRef,
  afterRenderEffect, ChangeDetectionStrategy,
} from '@angular/core';
import { TFlashSaleHead, TFlashSaleItem } from '../../types/brochure.type';
import { FlashSaleCardComponent } from "../../../components/brochure-card/flash-sale-card/flash-sale-card.component";
import { formatThaiDateRangeShort, inclusiveDayCount } from '../../../lib/brochure/thai-date';
import { flashSaleSlots, MAX_FLASH_SALE_SLOTS } from '../../../lib/brochure/flash-sale-layout';

/** The background is a fixed project asset, not a per-promotion upload; the
 *  `linkimg` field is no longer read. See
 *  docs/brochure-restyle/FLASH-SALE-ASSET-LIST.md §6.2. */
const FS_BACKGROUND = '/image/FS/bg.jpg'

/** The artwork leaves ~415px for the day number and one digit fills ~399px of
 *  it, so two digits overlap วันเท่านั้น. Design chose to cap the display at
 *  9 rather than redraw the panel. A longer promotion therefore prints a day
 *  count it does not have — the page component warns on export. */
const MAX_RENDERABLE_DAYS = 9

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
     and returns silently when it matches nothing. Renaming these breaks
     export with no error shown. */
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

  private dateEl = viewChild<ElementRef<HTMLElement>>('dateEl')

  /** inclusive day count; `day` from the API, else derived from the range */
  dayCount = computed(() => {
    const head = this.head()
    if (head?.day && head.day > 0) return head.day
    return inclusiveDayCount(head?.fromDate, head?.toDate)
  })

  /** one <img> per digit, from the 0-9 set design supplied */
  dayDigits = computed(() => {
    const days = this.dayCount()
    if (!days || days < 1) return []
    return String(Math.min(days, MAX_RENDERABLE_DAYS)).split('')
  })

  /** true when the printed number is not the real one */
  dayTruncated = computed(() => (this.dayCount() ?? 0) > MAX_RENDERABLE_DAYS)

  /** `dayActive` already carries the authored range ("01-07 พ.ย. 2568" on
   *  promotion 408), so it wins; the computed form is the fallback for
   *  promotions that leave it blank. */
  dateRange = computed(() => {
    const head = this.head()
    const authored = head?.dayActive?.trim()
    if (authored) return authored
    return formatThaiDateRangeShort(head?.fromDate, head?.toDate)
  })

  visibleItems = computed(() => (this.items() ?? []).slice(0, MAX_FLASH_SALE_SLOTS))

  slots = computed(() => flashSaleSlots(this.visibleItems().length))

  constructor() {
    // the date chip is baked into the plate at a fixed width, so the type
    // shrinks to fit rather than the chip growing. Design accepted this.
    afterRenderEffect(() => {
      this.dateRange()
      const el = this.dateEl()?.nativeElement
      if (el) fitToWidth(el)
    })
  }
}

/** Shrink until the text sits inside its box. Sizes are derived from the
 *  element's own height so one rule serves the preview and the 4160px export. */
function fitToWidth(el: HTMLElement) {
  const base = el.clientHeight * 0.45
  if (!base) return
  const limit = el.clientWidth
  const step = base * 0.02
  let size = base
  el.style.fontSize = `${size}px`
  let guard = 0
  while (el.scrollWidth > limit && size > base * 0.5 && guard++ < 60) {
    size -= step
    el.style.fontSize = `${size}px`
  }
}
