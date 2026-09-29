import { TParsedRow } from './item-price-import-excel.service';
import {
  highlightedLadderCells,
  ladderCellState,
  mergeResolvedRows,
  sendableRows,
  summarizeRows,
} from './item-price-import-ladder';
import { TPriceLadder, TResolvedLine } from './item-price-import.types';

const ladder: TPriceLadder = {
  price1: 2500, price2: 2400, price3: 2350, price4: 2300, price5: 2250, price6: 2100,
  priceA: 0, priceB: 0, priceC: 0,
}

const parsedRow = (rowNumber: number, over: Partial<TParsedRow> = {}): TParsedRow => ({
  rowNumber,
  barcode: `B${rowNumber}`,
  price: 100,
  name: null,
  rawPrice: '100',
  valid: true,
  reasonCode: null,
  reason: null,
  ...over,
})

const resolvedLine = (rowNumber: number, over: Partial<TResolvedLine> = {}): TResolvedLine => ({
  rowNumber,
  barcode: `B${rowNumber}`,
  price: 2199,
  name: null,
  status: 'OK',
  reasonCode: null,
  reason: null,
  matchedBy: 'GOODINFO',
  goodCode: '000123',
  goodName: 'Good',
  competitiveGroup: '-',
  ladder,
  levels: [{ level: '1', memberPrice: 2500, walkInPrice: null, branchCount: 14, qualifies: true }],
  branchesAbove: 59,
  branchesBelow: 3,
  overlapping: [],
  ...over,
})

describe('item-price-import-ladder', () => {
  describe('highlightedLadderCells', () => {
    it('marks cells strictly above the promo price and ignores 0 cells', () => {
      const set = highlightedLadderCells(ladder, 2300)
      expect([...set].sort()).toEqual(['price1', 'price2', 'price3'])
      expect(set.has('price4')).toBeFalse()   // equal is not above
      expect(set.has('priceA')).toBeFalse()   // 0 never qualifies
    })

    it('highlights every non-zero cell for a free item', () => {
      expect(highlightedLadderCells(ladder, 0).size).toBe(6)
    })

    it('returns an empty set for a null ladder', () => {
      expect(highlightedLadderCells(null, 10).size).toBe(0)
    })
  })

  describe('mergeResolvedRows', () => {
    it('keeps client errors and takes the server verdict for valid rows, by rowNumber', () => {
      const parsed = [
        parsedRow(2),
        parsedRow(3, { valid: false, reasonCode: 'INVALID_PRICE', reason: 'bad' }),
        parsedRow(4),
      ]
      const resolved = [
        resolvedLine(4, { status: 'SKIP', reasonCode: 'NO_BRANCH_ABOVE_PRICE', reason: 'skip' }),
        resolvedLine(2),
      ]
      const rows = mergeResolvedRows(parsed, resolved)

      expect(rows.map(r => r.rowNumber)).toEqual([2, 3, 4])
      expect(rows[0].status).toBe('OK')
      expect(rows[0].goodCode).toBe('000123')
      expect(rows[0].highlight.has('price1')).toBeTrue()
      expect(rows[1].status).toBe('ERROR')
      expect(rows[1].reasonCode).toBe('INVALID_PRICE')
      expect(rows[1].clientError).toBeTrue()
      expect(rows[2].status).toBe('SKIP')
      expect(rows[2].reasonCode).toBe('NO_BRANCH_ABOVE_PRICE')
    })

    it('flags a valid row the server did not echo back as ERROR', () => {
      const rows = mergeResolvedRows([parsedRow(2), parsedRow(3)], [resolvedLine(2)])
      expect(rows[1].status).toBe('ERROR')
      expect(rows[1].clientError).toBeFalse()
    })

    it('shows unresolved valid rows as OK with no verdict when nothing has been resolved yet', () => {
      const rows = mergeResolvedRows([parsedRow(2)], null)
      expect(rows[0].status).toBe('OK')
      expect(rows[0].ladder).toBeNull()
    })
  })

  describe('ladderCellState', () => {
    it('distinguishes above / not above / empty', () => {
      const [row] = mergeResolvedRows([parsedRow(2)], [resolvedLine(2, { price: 2300 })])
      expect(ladderCellState(row, 'price1')).toBe('above')
      expect(ladderCellState(row, 'price6')).toBe('notAbove')
      expect(ladderCellState(row, 'priceA')).toBe('empty')
    })
  })

  describe('summarizeRows / sendableRows', () => {
    it('counts statuses', () => {
      const s = summarizeRows([{ status: 'OK' }, { status: 'OK' }, { status: 'SKIP' }, { status: 'ERROR' }])
      expect(s).toEqual({ total: 4, ok: 2, skip: 1, error: 1 })
    })

    it('sends only OK rows that are not excluded', () => {
      const rows = mergeResolvedRows(
        [parsedRow(2), parsedRow(3), parsedRow(4)],
        [resolvedLine(2), resolvedLine(3), resolvedLine(4, { status: 'SKIP' })],
      )
      const out = sendableRows(rows, new Set([3]))
      expect(out.map(r => r.rowNumber)).toEqual([2])
    })
  })
})
