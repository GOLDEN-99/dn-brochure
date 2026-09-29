import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CrmPromotionService } from '../../../../service/crm-promotion/crm-promotion.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { PromotionSourcePipe } from '../../../../lib/crm-promotion/promotion-source.pipe';
import { TDayState } from '../../../../types/crm-promotion.type';
import { ItemPriceImportExcelService, TParsedRow } from './item-price-import-excel.service';
import {
  LADDER_KEYS,
  LADDER_LABELS,
  TImportTableRow,
  ladderCellState,
  mergeResolvedRows,
  sendableRows,
  summarizeRows,
} from './item-price-import-ladder';
import {
  OVERLAP_OUTCOME_LABEL,
  TApiValidationError,
  TCreateItemPriceRequest,
  TItemPriceLine,
  TItemPriceSource,
  TResolveResponse,
} from './item-price-import.types';

/** header: no file yet · parsed: sheet read, not yet resolved · resolved: server verdict shown · submitting: POST in flight */
export type TImportState = 'header' | 'parsed' | 'resolved' | 'submitting'

export type THeaderErrors = Partial<Record<'name' | 'startDate' | 'endDate' | 'dateRange' | 'promotionOrder', string>>

// Same order and labels as DayCheckbooxComponent / PromotionDatetimeComponent (index 0 = Sunday),
// so the "1111111" string means the same thing the rest of the module writes.
export const DAY_LABELS: readonly string[] = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์']

const ALL_DAYS: TDayState = [true, true, true, true, true, true, true]

const isoToday = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

@Component({
  selector: 'app-item-price-import',
  imports: [FormsModule, DecimalPipe, KeyValuePipe, RouterLink, PromotionSourcePipe],
  providers: [ItemPriceImportExcelService],
  templateUrl: './item-price-import.component.html',
  styleUrl: './item-price-import.component.scss',
})
export class ItemPriceImportComponent {
  private readonly excel = inject(ItemPriceImportExcelService)
  private readonly service = inject(CrmPromotionService)
  private readonly toast = inject(ToastService)
  private readonly router = inject(Router)

  readonly ladderKeys = LADDER_KEYS
  readonly ladderLabels = LADDER_LABELS
  readonly dayLabels = DAY_LABELS
  readonly outcomeLabel = OVERLAP_OUTCOME_LABEL
  readonly sourceOptions: readonly TItemPriceSource[] = ['SUPPLIER', 'HU', 'BOTH']
  readonly cellState = ladderCellState

  // ── Header form (plain signals; the form is five fields, a schema would be heavier than the page) ──
  readonly name = signal('')
  readonly startDate = signal(isoToday())
  readonly endDate = signal(isoToday())
  readonly source = signal<TItemPriceSource>('SUPPLIER')
  readonly promotionOrder = signal(1)
  readonly activeDay = signal<TDayState>([...ALL_DAYS] as TDayState)
  readonly headerTouched = signal(false)

  /** HU is always last in the calculation order; the select is disabled and the value pinned. */
  readonly isHu = computed(() => this.source() === 'HU')
  readonly effectivePromotionOrder = computed(() => (this.isHu() ? 0 : this.promotionOrder()))
  readonly activeDayString = computed(() => this.activeDay().map(d => (d ? '1' : '0')).join(''))
  readonly everyDay = computed(() => this.activeDay().every(Boolean))

  readonly headerErrors = computed<THeaderErrors>(() => {
    const errors: THeaderErrors = {}
    if (!this.name().trim()) errors.name = 'กรุณาระบุชื่อแคมเปญ'
    const start = this.startDate()
    const end = this.endDate()
    if (!ISO_DATE.test(start)) errors.startDate = 'กรุณาระบุวันที่เริ่ม'
    if (!ISO_DATE.test(end)) errors.endDate = 'กรุณาระบุวันที่สิ้นสุด'
    if (!errors.startDate && !errors.endDate && end < start) errors.dateRange = 'วันที่เริ่มต้องไม่มากกว่าวันสิ้นสุด'
    const order = this.effectivePromotionOrder()
    if (!Number.isInteger(order) || order < 0) errors.promotionOrder = 'ลำดับการคำนวณต้องเป็นจำนวนเต็ม >= 0'
    return errors
  })
  readonly headerValid = computed(() => Object.keys(this.headerErrors()).length === 0)
  readonly datesValid = computed(() => {
    const e = this.headerErrors()
    return !e.startDate && !e.endDate && !e.dateRange
  })

  // ── Upload / resolve state ──
  readonly state = signal<TImportState>('header')
  readonly fileName = signal('')
  readonly parsedRows = signal<TParsedRow[]>([])
  readonly resolveResponse = signal<TResolveResponse | null>(null)
  readonly excluded = signal<ReadonlySet<number>>(new Set())
  readonly expandedOverlaps = signal<ReadonlySet<number>>(new Set())
  readonly resolving = signal(false)
  readonly errorMessage = signal('')
  readonly apiFieldErrors = signal<Record<string, string[]> | null>(null)

  readonly tableRows = computed<TImportTableRow[]>(() =>
    mergeResolvedRows(this.parsedRows(), this.resolveResponse()?.rows ?? null),
  )
  readonly summary = computed(() => summarizeRows(this.tableRows()))
  readonly clientErrorCount = computed(() => this.parsedRows().filter(r => !r.valid).length)
  readonly sendable = computed(() => sendableRows(this.tableRows(), this.excluded()))
  readonly sendableCount = computed(() => this.sendable().length)
  readonly canIssue = computed(
    () => this.state() === 'resolved' && this.headerValid() && this.sendableCount() > 0,
  )

  // ── Header handlers ──
  onSourceChange(value: string) {
    this.source.set(value as TItemPriceSource)
  }

  onPromotionOrderChange(value: string | number) {
    const n = Number(value)
    this.promotionOrder.set(Number.isFinite(n) ? n : -1)
  }

  toggleEveryDay(on: boolean) {
    this.activeDay.set(Array.from({ length: 7 }, () => on) as TDayState)
  }

  toggleDay(on: boolean, idx: number) {
    this.activeDay.update(prev => prev.map((d, i) => (i === idx ? on : d)) as TDayState)
  }

  // ── Upload ──
  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    this.headerTouched.set(true)
    this.fileName.set(file.name)
    this.errorMessage.set('')
    this.apiFieldErrors.set(null)

    const result = await this.excel.parseExcelFile(file)
    input.value = ''
    if (!result.success) {
      this.errorMessage.set(result.error)
      return
    }
    this.applyParsedRows(result.rows)
    if (this.datesValid()) this.resolve()
  }

  /** Public so the state machine can be driven without a real xlsx file. */
  applyParsedRows(rows: TParsedRow[]) {
    this.parsedRows.set(rows)
    this.resolveResponse.set(null)
    this.excluded.set(new Set())
    this.expandedOverlaps.set(new Set())
    this.state.set('parsed')
  }

  resetFile() {
    this.parsedRows.set([])
    this.resolveResponse.set(null)
    this.excluded.set(new Set())
    this.expandedOverlaps.set(new Set())
    this.fileName.set('')
    this.errorMessage.set('')
    this.apiFieldErrors.set(null)
    this.state.set('header')
  }

  downloadTemplate() {
    this.excel.downloadTemplate()
  }

  // ── Resolve ──
  resolve() {
    if (this.resolving() || this.state() === 'header' || this.state() === 'submitting') return
    this.headerTouched.set(true)
    if (!this.datesValid()) {
      this.errorMessage.set('กรุณาระบุช่วงวันที่ให้ถูกต้องก่อนตรวจสอบราคา')
      return
    }
    const lines = this.parsedRows().filter(r => r.valid).map(toLine)
    if (lines.length === 0) {
      // Nothing the server can look at; show the client verdict as the final one.
      this.resolveResponse.set({ rows: [], summary: { total: 0, ok: 0, skip: 0, error: 0 } })
      this.state.set('resolved')
      return
    }
    this.resolving.set(true)
    this.errorMessage.set('')
    this.service.resolveItemPrice({
      startDate: this.startDate(),
      endDate: this.endDate(),
      promotionOrder: this.effectivePromotionOrder(),
      lines,
    }).subscribe({
      next: res => {
        this.resolveResponse.set(res)
        this.excluded.set(new Set())
        this.state.set('resolved')
        this.resolving.set(false)
      },
      error: (err: unknown) => {
        this.resolving.set(false)
        this.errorMessage.set(extractMessage(err) ?? 'ตรวจสอบราคาไม่สำเร็จ')
      },
    })
  }

  // ── Table interaction ──
  isExcluded(rowNumber: number) {
    return this.excluded().has(rowNumber)
  }

  setExcluded(rowNumber: number, excluded: boolean) {
    this.excluded.update(prev => {
      const next = new Set(prev)
      if (excluded) next.add(rowNumber)
      else next.delete(rowNumber)
      return next
    })
  }

  toggleOverlaps(rowNumber: number) {
    this.expandedOverlaps.update(prev => {
      const next = new Set(prev)
      if (next.has(rowNumber)) next.delete(rowNumber)
      else next.add(rowNumber)
      return next
    })
  }

  isOverlapExpanded(rowNumber: number) {
    return this.expandedOverlaps().has(rowNumber)
  }

  // ── Issue ──
  buildRequest(): TCreateItemPriceRequest {
    // TODO(createdBy): send the signed-in emplCode once the CRM module has one; the API defaults it.
    return {
      name: this.name().trim(),
      startDate: this.startDate(),
      endDate: this.endDate(),
      source: this.source(),
      promotionOrder: this.effectivePromotionOrder(),
      activeDay: this.activeDayString(),
      lines: this.sendable().map(toLine),
    }
  }

  issue() {
    this.headerTouched.set(true)
    if (!this.canIssue()) return
    const n = this.sendableCount()
    if (!window.confirm(`ออกโปรโมชั่น ${n} รายการ ใช่หรือไม่?`)) return

    this.state.set('submitting')
    this.errorMessage.set('')
    this.apiFieldErrors.set(null)
    this.service.createItemPriceRequest(this.buildRequest()).subscribe({
      next: ({ id }) => {
        this.toast.success('รับคำขอแล้ว กำลังออกโปรโมชั่น')
        this.router.navigate(['/crm-promotion', 'item-price-requests', id])
      },
      error: (err: unknown) => {
        this.state.set('resolved')
        const body = (err as HttpErrorResponse)?.error as TApiValidationError | undefined
        if ((err as HttpErrorResponse)?.status === 400 && body) {
          this.apiFieldErrors.set(body.errors ?? null)
          this.errorMessage.set(body.message || 'ข้อมูลไม่ถูกต้อง')
        } else {
          this.errorMessage.set(extractMessage(err) ?? 'ออกโปรโมชั่นไม่สำเร็จ')
        }
        this.toast.danger('ออกโปรโมชั่นไม่สำเร็จ')
      },
    })
  }
}

const toLine = (r: { rowNumber: number; barcode: string; price: number; name: string | null }): TItemPriceLine => ({
  rowNumber: r.rowNumber,
  barcode: r.barcode,
  price: r.price,
  name: r.name,
})

function extractMessage(err: unknown): string | null {
  const e = err as { error?: { message?: string }; message?: string } | null
  return e?.error?.message ?? e?.message ?? null
}
