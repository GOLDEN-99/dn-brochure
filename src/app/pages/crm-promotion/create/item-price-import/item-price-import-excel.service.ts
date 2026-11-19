import { Injectable } from '@angular/core';
import { z } from 'zod';
import {
  CLIENT_REASON_LABEL,
  TClientReasonCode,
  TItemPriceLine,
} from './item-price-import.types';

// Module-scoped copy of the BatchExcelService pattern (lazy xlsx + zod). Deliberately not
// imported from service/other-income -- see the "shared UI trap" in the module CLAUDE.md.
const xlsxPromise = import('xlsx');

// ============ Column aliases ============

export type TImportColumn = 'barcode' | 'price' | 'name'

export const FIELD_ALIASES: Record<TImportColumn, string[]> = {
  barcode: ['barcode', 'barCode', 'Barcode', 'บาร์โค้ด', 'รหัสสินค้า'],
  price: ['price', 'promoPrice', 'ราคาโปร', 'ราคา'],
  name: ['name', 'ชื่อโปร'],
}

// ============ Zod ============

const excelNumber = z.union([
  z.number(),
  z.string().trim().min(1).transform((val, ctx) => {
    const parsed = Number.parseFloat(val.replaceAll(',', ''))
    if (Number.isNaN(parsed)) {
      ctx.addIssue({ code: 'custom', message: 'not a number' })
      return z.NEVER
    }
    return parsed
  }),
])

const hasAtMostTwoDecimals = (n: number) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6

export const ImportRowSchema = z.object({
  barcode: z.string().trim().min(1),
  price: excelNumber.pipe(
    z.number().finite().nonnegative().refine(hasAtMostTwoDecimals),
  ),
  name: z.string().trim().nullable(),
})

type TImportRowInput = z.input<typeof ImportRowSchema>

// ============ Types ============

export type TParsedRow = TItemPriceLine & {
  /** Raw price cell when the row failed price validation, for display. */
  rawPrice: string
  valid: boolean
  reasonCode: TClientReasonCode | null
  reason: string | null
}

export type TParseResult =
  | { success: true; rows: TParsedRow[] }
  | { success: false; error: string }

// ============ Service ============

@Injectable()
export class ItemPriceImportExcelService {

  /** Parse the first sheet; header on row 1, first data row is Excel row 2. */
  async parseExcelFile(file: File): Promise<TParseResult> {
    try {
      const XLSX = await xlsxPromise
      const data = new Uint8Array(await file.arrayBuffer())
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet)

      if (jsonData.length === 0) {
        return { success: false, error: 'ไฟล์ Excel ไม่มีข้อมูล' }
      }
      return { success: true, rows: this.validateRows(jsonData) }
    } catch (err) {
      console.error('Excel parse error:', err)
      return { success: false, error: 'ไม่สามารถอ่านไฟล์ Excel ได้' }
    }
  }

  /**
   * Validate raw sheet rows. Pure: exported so specs can feed it directly without xlsx.
   * Row order is preserved; duplicates mark the *later* occurrence.
   */
  validateRows(data: Record<string, unknown>[]): TParsedRow[] {
    const seen = new Set<string>()
    return data.map((row, index) => {
      const parsed = this.validateRow(row, index + 2)
      if (parsed.valid) {
        if (seen.has(parsed.barcode)) {
          return this.fail(parsed, 'DUPLICATE_IN_FILE')
        }
        seen.add(parsed.barcode)
      }
      return parsed
    })
  }

  private validateRow(row: Record<string, unknown>, rowNumber: number): TParsedRow {
    const input = this.normalizeRow(row)
    const base: TParsedRow = {
      rowNumber,
      barcode: input.barcode,
      price: 0,
      name: input.name,
      rawPrice: this.rawToString(this.getField(row, 'price')),
      valid: true,
      reasonCode: null,
      reason: null,
    }

    const result = ImportRowSchema.safeParse(input)
    if (result.success) {
      return { ...base, ...result.data, name: result.data.name || null }
    }

    // Barcode errors win over price errors: an empty row should read as "empty barcode".
    const paths = new Set(result.error.issues.map(i => String(i.path[0])))
    if (paths.has('barcode')) return this.fail(base, 'EMPTY_BARCODE')
    return this.fail(base, 'INVALID_PRICE')
  }

  private fail(row: TParsedRow, code: TClientReasonCode): TParsedRow {
    return { ...row, valid: false, reasonCode: code, reason: CLIENT_REASON_LABEL[code] }
  }

  private normalizeRow(row: Record<string, unknown>): TImportRowInput {
    const barcode = this.getField(row, 'barcode')
    const name = this.getField(row, 'name')
    return {
      barcode: this.rawToString(barcode),
      price: this.getField(row, 'price') as number | string,
      name: name === undefined || name === null ? null : this.rawToString(name),
    }
  }

  private rawToString(v: unknown): string {
    return typeof v === 'string' || typeof v === 'number' ? String(v).trim() : ''
  }

  private getField(row: Record<string, unknown>, field: TImportColumn): unknown {
    for (const alias of FIELD_ALIASES[field]) {
      if (row[alias] !== undefined) return row[alias]
    }
    return undefined
  }

  /** One sheet, header row barcode | price | name, one example row. */
  async downloadTemplate(): Promise<void> {
    const XLSX = await xlsxPromise
    const ws = XLSX.utils.aoa_to_sheet([
      ['barcode', 'price', 'name'],
      ['408569', 2199, ''],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'item-price-import-template.xlsx')
  }
}
