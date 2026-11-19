// A promoted product is the pair (goodCode, unitCode) -- workspace CRM-PROMOTION-UNIT-PLAN.md §3.
// The unit is GoodBarcode.unitCode of a goodAmou = 1 row: one good is sold in several units
// (strip and box) and the till matches both, so two rows of one good in two units are two
// products. Every Set / filter / track that used to key on goodCode keys on this instead.
//
// unitCode is null on a stored row the backfill has not reached yet (and on a REGISTERFEE pool
// derived at submit before 2026-10-07); the API resolves such a row's unit on write.

export type TProductRef = { goodCode: string; unitCode?: string | null }

export const productKey = ({ goodCode, unitCode }: TProductRef): string =>
  `${goodCode}|${unitCode ?? ''}`

export const sameProduct = (a: TProductRef, b: TProductRef): boolean => productKey(a) === productKey(b)

/** The pair the API stores, from any product-bearing object. */
export const toProductRef = ({ goodCode, unitCode }: TProductRef): { goodCode: string; unitCode: string | null } =>
  ({ goodCode, unitCode: unitCode ?? null })

/**
 * `(sku) name · unit ฿price` -- the one line a product takes in a picker or a list. sku is
 * GoodInfo.barCode (≤ 6 digits; blank on 11 goods) and a pack unit never carries it, so the unit's
 * own scan barcode stands in when sku is blank. price1 is shown so an author notices a ฿0 row;
 * nothing infers "gift" from it (plan §1.7).
 */
export function formatProductLabel(p: {
  goodName: string
  sku: string
  unitDesc?: string | null
  barcode?: string | null
  price1?: number | null
}): string {
  const code = p.sku?.trim() || p.barcode?.trim() || ''
  const unit = p.unitDesc?.trim() ? ` · ${p.unitDesc.trim()}` : ''
  const price = typeof p.price1 === 'number' ? ` ฿${p.price1}` : ''
  return `(${code}) ${p.goodName}${unit}${price}`
}
