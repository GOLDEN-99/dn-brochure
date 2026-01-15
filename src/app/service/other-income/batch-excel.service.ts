import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { TPeriodCreditBatch, TPeriodInvBatch, TPeriodReceBatch } from './period.service';

// ============ Zod Schemas ============

const excelNumber = z.union([
  z.number(),
  z.string().transform((val) => {
    const parsed = Number.parseFloat(val.replaceAll(',', ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  })
]);

const excelDate = z.union([
  // Excel serial date number
  z.number().transform((val) => {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
    return '';
  }),
  // ISO format: YYYY-MM-DD
  z.string().regex(/^\d{4}-\d{2}-\d{2}/).transform((val) => val.slice(0, 10)),
  // DD/MM/YYYY format
  z.string().regex(/^\d{1,2}\/\d{1,2}\/\d{4}/).transform((val) => {
    const [d, m, y] = val.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }),
  // Empty or invalid
  z.any().transform(() => '')
]);

export const BatchRowSchema = z.object({
  periodId: excelNumber.pipe(
    z.number().int().positive({ message: 'periodId ต้องเป็นตัวเลขมากกว่า 0' })
  ),
  numb: z.string().min(1, { message: 'เลขที่เอกสารว่าง' }),
  date: excelDate.pipe(
    z.string().min(1, { message: 'วันที่ไม่ถูกต้อง' })
  ),
  amount: excelNumber.pipe(
    z.number().positive({ message: 'ยอดเงินต้องมากกว่า 0' })
  ),
  remark: z.string().default('')
});

// ============ Types ============

export type BatchRowInput = z.input<typeof BatchRowSchema>;
export type BatchRowOutput = z.output<typeof BatchRowSchema>;

export type BatchType = 'invoice' | 'receipt' | 'credit';

export type TPreviewRow = {
  rowNumber: number;
  periodId: number;
  numb: string;
  date: string;
  amount: number;
  remark: string;
  valid: boolean;
  error?: string;
};

export type TBatchKey = keyof BatchRowInput;

export type TColumnHeader = { key: TBatchKey; value: string };

export type TMapper<I, O> = (input: I) => O
type TTypeMap<T extends BatchType> = T extends "invoice" ? TPeriodInvBatch : T extends "credit" ? TPeriodCreditBatch : TPeriodReceBatch

export type TBatchSchemaConfig<T extends BatchType> = {
  mapper: TMapper<BatchRowInput, TTypeMap<T>>,
  column: TColumnHeader[]
}

export type TParseResult = {
  success: true;
  data: TPreviewRow[];
} | {
  success: false;
  error: string;
};

// ============ Constants ============

export const BATCH_TYPE_LABELS: Record<BatchType, string> = {
  invoice: 'ใบแจ้งหนี้',
  receipt: 'ใบเสร็จ',
  credit: 'ใบลดหนี้'
};

export const COLUMN_HEADERS: Record<BatchType, TBatchSchemaConfig<BatchType>> = {
  invoice: {
    mapper: (v) => ({
      periodId: Number(v.periodId),
      invNumb: v.numb,
      invDate: v.date,
      invAmount: Number(v.amount),
      invRemark: v.remark ?? ""
    }),
    column: [
      { key: 'periodId', value: 'Period ID' },
      { key: 'numb', value: 'เลขที่ใบแจ้งหนี้' },
      { key: 'date', value: 'วันที่ใบแจ้งหนี้' },
      { key: 'amount', value: 'ยอด' },
      { key: 'remark', value: 'หมายเหตุ' }
    ]
  },
  receipt: {
    mapper: (v) => ({
      periodId: Number(v.periodId),
      receNumb: v.numb,
      receDate: v.date,
      receAmount: Number(v.amount),
      receRemark: v.remark ?? ""
    }),
    column: [
      { key: 'periodId', value: 'Period ID' },
      { key: 'numb', value: 'เลขที่ใบเสร็จรับเงิน' },
      { key: 'date', value: 'วันที่ใบเสร็จรับเงิน' },
      { key: 'amount', value: 'ยอด' },
      { key: 'remark', value: 'หมายเหตุ' }
    ],
  },
  credit: {
    mapper: (v) => ({
      periodId: Number(v.periodId),
      creditNumb: v.numb,
      creditDate: v.date,
      creditAmount: Number(v.amount),
      creditRemark: v.remark ?? ""
    }),
    column: [
      { key: 'periodId', value: 'Period ID' },
      { key: 'numb', value: 'เลขที่ใบลดหนี้' },
      { key: 'date', value: 'วันที่ใบลดหนี้' },
      { key: 'amount', value: 'ยอด' },
      { key: 'remark', value: 'หมายเหตุ' }
    ]
  }
};

// Field name aliases for flexible Excel column mapping
const FIELD_ALIASES: Record<TBatchKey, string[]> = {
  periodId: ['periodId', 'PeriodId', 'period_id', 'Period ID'],
  numb: ['numb', 'Numb', 'number', 'Number', 'เลขที่'],
  date: ['date', 'Date', 'วันที่'],
  amount: ['amount', 'Amount', 'ยอด', 'จำนวนเงิน'],
  remark: ['remark', 'Remark', 'หมายเหตุ', 'note', 'Note']
};

// ============ Service ============

@Injectable()
export class BatchExcelService {

  /**
   * Parse Excel file and validate rows using Zod schema
   */
  async parseExcelFile(file: File): Promise<TParseResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

      if (jsonData.length === 0) {
        return { success: false, error: 'ไฟล์ Excel ไม่มีข้อมูล' };
      }

      const rows = this.validateRows(jsonData);
      return { success: true, data: rows };
    } catch (err) {
      console.error('Excel parse error:', err);
      return { success: false, error: 'ไม่สามารถอ่านไฟล์ Excel ได้' };
    }
  }

  /**
   * Validate array of raw Excel rows
   */
  validateRows(data: Record<string, unknown>[]): TPreviewRow[] {
    return data.map((row, index) => this.validateRow(row, index + 2));
  }

  /**
   * Validate single row and return preview row with validation result
   */
  private validateRow(row: Record<string, unknown>, rowNumber: number): TPreviewRow {
    const normalizedRow = this.normalizeRow(row);
    const result = BatchRowSchema.safeParse(normalizedRow);

    if (result.success) {
      return {
        rowNumber,
        ...result.data,
        valid: true
      };
    }

    //add default value when parse result fail
    const errors = result.error.issues.map(issue => issue.message);
    return {
      rowNumber,
      periodId: typeof normalizedRow.periodId === 'number' ? normalizedRow.periodId : 0,
      numb: normalizedRow.numb,
      date: typeof normalizedRow.date === 'string' ? normalizedRow.date : '',
      amount: typeof normalizedRow.amount === 'number' ? normalizedRow.amount : 0,
      remark: normalizedRow.remark ?? '',
      valid: false,
      error: errors.join(', ')
    };
  }

  /**
   * Normalize row by mapping various column name formats to standard field names
   */
  private normalizeRow(row: Record<string, unknown>): BatchRowInput {
    const numb = this.getField(row, 'numb');
    const remark = this.getField(row, 'remark');
    return {
      periodId: this.getField(row, 'periodId') as number | string,
      numb: typeof numb === 'string' || typeof numb === 'number' ? String(numb).trim() : '',
      date: this.getField(row, 'date') as number | string,
      amount: this.getField(row, 'amount') as number | string,
      remark: typeof remark === 'string' || typeof remark === 'number' ? String(remark).trim() : ''
    };
  }

  /**
   * Get field value from row using multiple possible column names
   */
  private getField(row: Record<string, unknown>, field: TBatchKey): unknown {
    const aliases = FIELD_ALIASES[field];
    for (const alias of aliases) {
      if (row[alias] !== undefined) {
        return row[alias];
      }
    }
    return undefined;
  }

  /**
   * Generate and download Excel template
   */
  downloadTemplate(batchType: BatchType): void {
    const headers = ['periodId', 'numb', 'date', 'amount', 'remark'];
    const exampleData: Record<BatchType, (string | number)[]> = {
      invoice: [1, 'INV-001', '2024-01-15', 1000, 'หมายเหตุ'],
      receipt: [1, 'REC-001', '2024-01-15', 1000, 'หมายเหตุ'],
      credit: [1, 'CN-001', '2024-01-15', 500, 'หมายเหตุ']
    };

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleData[batchType]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `batch-${batchType}-template.xlsx`);
  }

  /**
   * Generate and download error report
   */
  downloadErrorReport(errors: Array<{ rowNumber: number; periodId: number; message: string }>): void {
    if (errors.length === 0) return;

    const data = errors.map(e => ({
      'Row Number': e.rowNumber,
      'Period ID': e.periodId,
      'Error': e.message
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Errors');
    XLSX.writeFile(wb, `batch-errors-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Get column headers for batch type
   */
  getColumnHeaders(batchType: BatchType): TColumnHeader[] {
    return COLUMN_HEADERS[batchType].column;
  }

  /*
  get result mapper
  */
  getResultMapper(batchType: BatchType): TMapper<BatchRowInput, TTypeMap<BatchType>> {
    return COLUMN_HEADERS[batchType].mapper;
  }

  /**
   * Get label for batch type
   */
  getBatchTypeLabel(batchType: BatchType): string {
    return BATCH_TYPE_LABELS[batchType];
  }
}
