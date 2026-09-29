import { TParsedRow } from './item-price-import-excel.service';
import {
  TLadderKey,
  TOverlappingPromotion,
  TPriceLadder,
  TReasonCode,
  TResolveRowStatus,
  TResolveSummary,
  TResolvedLevel,
  TResolvedLine,
} from './item-price-import.types';

export const LADDER_KEYS: readonly TLadderKey[] = [
  'price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'priceA', 'priceB', 'priceC',
]

export const LADDER_LABELS: Record<TLadderKey, string> = {
  price1: 'P1', price2: 'P2', price3: 'P3', price4: 'P4', price5: 'P5', price6: 'P6',
  priceA: 'A', priceB: 'B', priceC: 'C',
}

export type TLadderCellState = 'above' | 'notAbove' | 'empty'

export type TImportTableRow = {
  rowNumber: number
  barcode: string
  price: number
  name: string | null
  goodCode: string | null
  goodName: string | null
  status: TResolveRowStatus
  reasonCode: TReasonCode | null
  reason: string | null
  ladder: TPriceLadder | null
  /** Ladder cells whose value is strictly above the promo price. */
  highlight: ReadonlySet<TLadderKey>
  levels: TResolvedLevel[]
  branchesAbove: number
  branchesBelow: number
  overlapping: TOverlappingPromotion[]
  /** Only true for client-side failures -- the server never saw the row. */
  clientError: boolean
}

/** Ladder cells strictly above the promo price. 0 / null cells never qualify. */
export function highlightedLadderCells(ladder: TPriceLadder | null, promoPrice: number): Set<TLadderKey> {
  const out = new Set<TLadderKey>()
  if (!ladder) return out
  for (const key of LADDER_KEYS) {
    const v = ladder[key]
    if (typeof v === 'number' && v > 0 && v > promoPrice) out.add(key)
  }
  return out
}

export function ladderCellState(row: TImportTableRow, key: TLadderKey): TLadderCellState {
  const v = row.ladder?.[key]
  if (!v) return 'empty'
  return row.highlight.has(key) ? 'above' : 'notAbove'
}

function fromClientRow(row: TParsedRow): TImportTableRow {
  return {
    rowNumber: row.rowNumber,
    barcode: row.barcode,
    price: row.price,
    name: row.name,
    goodCode: null,
    goodName: null,
    status: 'ERROR',
    reasonCode: row.reasonCode,
    reason: row.reason,
    ladder: null,
    highlight: new Set(),
    levels: [],
    branchesAbove: 0,
    branchesBelow: 0,
    overlapping: [],
    clientError: true,
  }
}

function fromResolvedLine(line: TResolvedLine): TImportTableRow {
  return {
    rowNumber: line.rowNumber,
    barcode: line.barcode,
    price: line.price,
    name: line.name,
    goodCode: line.goodCode,
    goodName: line.goodName,
    status: line.status,
    reasonCode: line.reasonCode,
    reason: line.reason,
    ladder: line.ladder,
    highlight: highlightedLadderCells(line.ladder, line.price),
    levels: line.levels ?? [],
    branchesAbove: line.branchesAbove,
    branchesBelow: line.branchesBelow,
    overlapping: line.overlapping ?? [],
    clientError: false,
  }
}

/**
 * Merge the parsed sheet with the resolve response by rowNumber. Client-invalid rows keep
 * their client reason; valid rows take the server's verdict. A valid row the server did not
 * echo back (should not happen) is shown as ERROR so it can never be sent blind.
 */
export function mergeResolvedRows(parsed: TParsedRow[], resolved: TResolvedLine[] | null): TImportTableRow[] {
  const byRow = new Map<number, TResolvedLine>()
  for (const line of resolved ?? []) byRow.set(line.rowNumber, line)

  return parsed.map(row => {
    if (!row.valid) return fromClientRow(row)
    const line = byRow.get(row.rowNumber)
    if (line) return fromResolvedLine(line)
    if (resolved === null) {
      // Not resolved yet: show the parsed row without a verdict.
      return { ...fromClientRow(row), status: 'OK', reasonCode: null, reason: null, clientError: false }
    }
    return {
      ...fromClientRow(row),
      clientError: false,
      reasonCode: null,
      reason: 'ไม่ได้รับผลตรวจสอบจากเซิร์ฟเวอร์',
    }
  })
}

export function summarizeRows(rows: readonly { status: TResolveRowStatus }[]): TResolveSummary {
  const summary: TResolveSummary = { total: rows.length, ok: 0, skip: 0, error: 0 }
  for (const r of rows) {
    if (r.status === 'OK') summary.ok++
    else if (r.status === 'SKIP') summary.skip++
    else summary.error++
  }
  return summary
}

/** OK rows that the user has not excluded -- the exact set the create POST sends. */
export function sendableRows(rows: readonly TImportTableRow[], excluded: ReadonlySet<number>): TImportTableRow[] {
  return rows.filter(r => r.status === 'OK' && !excluded.has(r.rowNumber))
}
