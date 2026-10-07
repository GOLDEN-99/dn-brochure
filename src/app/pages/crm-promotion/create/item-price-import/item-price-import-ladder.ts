import { TParsedRow } from './item-price-import-excel.service';
import {
  TItemPriceLine,
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

/**
 * One table row = one (sheet row, unit). A sheet row whose good is sold in several units is
 * `splitCount` table rows sharing `rowNumber` (CRM-PROMOTION-UNIT-PLAN.md §1.5), so the row's
 * identity -- what exclusion and the overlap toggle key on -- is `key`, never `rowNumber` alone.
 */
export type TImportTableRow = {
  /** `${rowNumber}:${unitCode ?? ''}` -- see rowKey. */
  key: string
  rowNumber: number
  barcode: string
  price: number
  name: string | null
  goodCode: string | null
  goodName: string | null
  unitCode: string | null
  unitDesc: string | null
  unitFactor: number | null
  unitBarcode: string | null
  splitSeq: number
  splitCount: number
  status: TResolveRowStatus
  reasonCode: TReasonCode | null
  reason: string | null
  ladder: TPriceLadder | null
  /** Ladder cells whose value is strictly above the promo price. */
  highlight: ReadonlySet<TLadderKey>
  levels: TResolvedLevel[]
  branchesAbove: number
  branchesBelow: number
  branchesInScope: number
  overlapping: TOverlappingPromotion[]
  /** Only true for client-side failures -- the server never saw the row. */
  clientError: boolean
}

export const rowKey = (rowNumber: number, unitCode: string | null | undefined): string =>
  `${rowNumber}:${unitCode ?? ''}`

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
    key: rowKey(row.rowNumber, null),
    rowNumber: row.rowNumber,
    barcode: row.barcode,
    price: row.price,
    name: row.name,
    goodCode: null,
    goodName: null,
    unitCode: null,
    unitDesc: null,
    unitFactor: null,
    unitBarcode: null,
    splitSeq: 1,
    splitCount: 1,
    status: 'ERROR',
    reasonCode: row.reasonCode,
    reason: row.reason,
    ladder: null,
    highlight: new Set(),
    levels: [],
    branchesAbove: 0,
    branchesBelow: 0,
    branchesInScope: 0,
    overlapping: [],
    clientError: true,
  }
}

function fromResolvedLine(line: TResolvedLine): TImportTableRow {
  return {
    key: rowKey(line.rowNumber, line.unitCode),
    rowNumber: line.rowNumber,
    barcode: line.barcode,
    price: line.price,
    name: line.name,
    goodCode: line.goodCode,
    goodName: line.goodName,
    unitCode: line.unitCode ?? null,
    unitDesc: line.unitDesc ?? null,
    unitFactor: line.unitFactor ?? null,
    unitBarcode: line.unitBarcode ?? null,
    splitSeq: line.splitSeq ?? 1,
    splitCount: line.splitCount ?? 1,
    status: line.status,
    reasonCode: line.reasonCode,
    reason: line.reason,
    ladder: line.ladder,
    highlight: highlightedLadderCells(line.ladder, line.price),
    levels: line.levels ?? [],
    branchesAbove: line.branchesAbove,
    branchesBelow: line.branchesBelow,
    branchesInScope: line.branchesInScope ?? line.branchesAbove,
    overlapping: line.overlapping ?? [],
    clientError: false,
  }
}

/**
 * Merge the parsed sheet with the resolve response by rowNumber. Client-invalid rows keep
 * their client reason; valid rows take the server's verdict -- one table row per server row,
 * so a good sold in several units expands in place, in the server's unit order. A valid row the
 * server did not echo back (should not happen) is shown as ERROR so it can never be sent blind.
 */
export function mergeResolvedRows(parsed: TParsedRow[], resolved: TResolvedLine[] | null): TImportTableRow[] {
  const byRow = new Map<number, TResolvedLine[]>()
  for (const line of resolved ?? []) {
    const list = byRow.get(line.rowNumber)
    if (list) list.push(line)
    else byRow.set(line.rowNumber, [line])
  }

  return parsed.flatMap(row => {
    if (!row.valid) return [fromClientRow(row)]
    const lines = byRow.get(row.rowNumber)
    if (lines && lines.length > 0) return lines.map(fromResolvedLine)
    if (resolved === null) {
      // Not resolved yet: show the parsed row without a verdict.
      return [{ ...fromClientRow(row), status: 'OK' as const, reasonCode: null, reason: null, clientError: false }]
    }
    return [{
      ...fromClientRow(row),
      clientError: false,
      reasonCode: null,
      reason: 'ไม่ได้รับผลตรวจสอบจากเซิร์ฟเวอร์',
    }]
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

/** OK rows that the user has not excluded (by row key) -- the exact set the create POST sends. */
export function sendableRows(rows: readonly TImportTableRow[], excluded: ReadonlySet<string>): TImportTableRow[] {
  return rows.filter(r => r.status === 'OK' && !excluded.has(r.key))
}

/**
 * The POST lines for a set of sendable table rows: one per sheet row. A row the server split
 * names the units that are left in (`unitCodes`) so the server issues exactly those; an unsplit
 * row sends the plain line, as before units existed.
 */
export function toRequestLines(sendable: readonly TImportTableRow[]): TItemPriceLine[] {
  const byRow = new Map<number, TImportTableRow[]>()
  for (const r of sendable) {
    const list = byRow.get(r.rowNumber)
    if (list) list.push(r)
    else byRow.set(r.rowNumber, [r])
  }
  return [...byRow.values()].map(rows => {
    const [first] = rows
    const line: TItemPriceLine = { rowNumber: first.rowNumber, barcode: first.barcode, price: first.price, name: first.name }
    if (rows.some(r => r.splitCount > 1)) {
      line.unitCodes = rows.map(r => r.unitCode).filter((u): u is string => !!u)
    }
    return line
  })
}
