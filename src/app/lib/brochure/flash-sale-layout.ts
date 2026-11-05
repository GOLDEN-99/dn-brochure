/** Card geometry for the Flash Sale page, as percentages of the 4160px page.
 *
 *  Measured off the layout samples the design team supplied
 *  (Drive: DN Flash Sale_Template / ตัวอย่างจำนวนช่องวางสินค้า), except the
 *  4-slot case, which they confirmed as 2 + 2 without sending a sample; it
 *  reuses the row-of-2 geometry from the 5-slot layout.
 *
 *  Two things the samples settle: cards are always square, and a row that is
 *  not full is centred. Card width therefore depends on how many cards share
 *  a row, not on the total.
 */

export type FlashSaleSlot = { left: string; top: string; width: string }

type Row = { top: number; width: number; lefts: number[] }

const LAYOUTS: Record<number, Row[]> = {
  1: [{ top: 36.1, width: 48.0, lefts: [26.1] }],
  2: [{ top: 38.0, width: 42.7, lefts: [5.5, 51.9] }],
  3: [{ top: 45.1, width: 28.2, lefts: [5.3, 36.0, 66.6] }],
  4: [
    { top: 32.7, width: 28.2, lefts: [20.6, 51.2] },
    { top: 62.8, width: 28.2, lefts: [20.6, 51.2] },
  ],
  5: [
    { top: 32.7, width: 28.2, lefts: [20.6, 51.2] },
    { top: 62.8, width: 28.2, lefts: [5.3, 36.0, 66.6] },
  ],
  6: [
    { top: 32.7, width: 28.2, lefts: [5.3, 36.0, 66.6] },
    { top: 62.8, width: 28.2, lefts: [5.3, 36.0, 66.6] },
  ],
  7: [
    { top: 36.1, width: 21.5, lefts: [5.3, 27.9, 50.6, 73.2] },
    { top: 62.8, width: 28.2, lefts: [5.3, 36.0, 66.6] },
  ],
}

/** the largest layout the artwork provides */
export const MAX_FLASH_SALE_SLOTS = 7

/**
 * Slots for `count` products, in render order.
 * A count above the largest layout is clamped: the extra products are not
 * drawn, because no artwork exists for them.
 */
export function flashSaleSlots(count: number): FlashSaleSlot[] {
  const n = Math.min(Math.max(Math.trunc(count) || 0, 0), MAX_FLASH_SALE_SLOTS)
  if (n < 1) return []
  const out: FlashSaleSlot[] = []
  for (const row of LAYOUTS[n]) {
    for (const left of row.lefts) {
      out.push({ left: `${left}%`, top: `${row.top}%`, width: `${row.width}%` })
    }
  }
  return out
}
