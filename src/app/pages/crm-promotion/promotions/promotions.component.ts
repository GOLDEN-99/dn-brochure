import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, concatMap, distinctUntilChanged, filter, from, map, of, switchMap } from 'rxjs';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { PromotionSourcePipe } from '../../../lib/crm-promotion/promotion-source.pipe';
import { resolvePromotionSource } from '../../../lib/crm-promotion/resolve-promotion-source';
import {
  describePromotion, PromotionDescription, PromotionSection, promotionSection,
} from '../../../lib/crm-promotion/describe-promotion';
import { TPromotionDetail, TPromotionListDetail, TPromotionListItem } from '../../../types/crm-promotion.type';

type SectionKey = PromotionSection | 'OTHER'

// The legacy F11 tabs, in their order (CRM-PROMOTIONS.md §3a "What the legacy cashier saw").
// OTHER only appears for a promotionType the vocabulary does not know.
const SECTIONS: { key: SectionKey, label: string, legacy: string }[] = [
  { key: 'GOODS', label: 'โปรสินค้า', legacy: 'เดิม: โปรโมชั่นสินค้า' },
  { key: 'SPEND', label: 'โปรซื้อครบยอดกลุ่มสินค้า', legacy: 'เดิม: โปรโมชั่นบริษัท' },
  { key: 'BILL', label: 'โปรท้ายบิล', legacy: 'เดิม: โปรโมชั่นทั่วไป' },
  { key: 'OTHER', label: 'ตรวจสอบ', legacy: 'ประเภทที่ระบบไม่รู้จัก' },
]

export const PAGE_SIZE = 25

// How the rows get their goods and tiers. 'bulk' is one GET ?include=details. 'perRow' is the
// fallback for an API without it: only the current page, one request at a time, because the API
// host refuses bursts past ~115 requests (CRM-PROMOTIONS.md §7b).
export type DetailMode = 'pending' | 'bulk' | 'perRow'

export type PromotionRow = {
  item: TPromotionListItem
  section: SectionKey
  // undefined while loading, null when the request failed
  detail: TPromotionListDetail | null | undefined
  description: PromotionDescription | null
  source: string
}

const isListDetail = (x: TPromotionListDetail | TPromotionListItem): x is TPromotionListDetail =>
  Array.isArray((x as TPromotionListDetail).tiers)

const toListDetail = ({ branches, ...rest }: TPromotionDetail): TPromotionListDetail =>
  ({ ...rest, branchCount: branches.length })

@Component({
  selector: 'app-promotions',
  imports: [DatePipe, FormsModule, PromotionSourcePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './promotions.component.html',
})
export class PromotionsComponent {
  private readonly service = inject(CrmPromotionService)
  private readonly router = inject(Router)

  readonly statusFilter = signal('')
  readonly query = signal('')
  readonly activeSection = signal<SectionKey>('GOODS')
  private readonly page = signal(0)

  readonly mode = signal<DetailMode>('pending')
  private readonly details = signal<ReadonlyMap<number, TPromotionListDetail | null>>(new Map())

  private readonly statusFiltered = computed(() => {
    const list = this.service.allPromotions()
    const s = this.statusFilter()
    return s ? list.filter(p => p.promotionStatus === s) : list
  })

  readonly rows = computed<PromotionRow[]>(() => {
    const details = this.details()
    const q = this.query().trim().toLowerCase()
    return this.statusFiltered()
      .map((item): PromotionRow => {
        const detail = details.has(item.id) ? details.get(item.id) : undefined
        return {
          item,
          section: promotionSection(item.promotionType, item.thresholdType) ?? 'OTHER',
          detail,
          description: detail ? describePromotion(detail) : null,
          source: resolvePromotionSource(item.source, item.promotionOrder),
        }
      })
      .filter(row => !q || matches(row, q))
      .sort((a, b) => a.item.promotionName.localeCompare(b.item.promotionName, 'th'))
  })

  readonly sections = computed(() => {
    const rows = this.rows()
    return SECTIONS
      .map(s => ({ ...s, rows: rows.filter(r => r.section === s.key) }))
      .filter(s => s.key !== 'OTHER' || s.rows.length > 0)
  })

  readonly visibleRows = computed(() =>
    this.sections().find(s => s.key === this.activeSection())?.rows ?? [])

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.visibleRows().length / PAGE_SIZE)))
  readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1))
  readonly pagedRows = computed(() =>
    this.visibleRows().slice(this.currentPage() * PAGE_SIZE, (this.currentPage() + 1) * PAGE_SIZE))

  // The ids on screen, for the per-row fallback. Keyed by ids only, so a row's detail arriving
  // (which rebuilds the row objects) does not restart the queue.
  private readonly fallbackIds = computed(() =>
    this.mode() === 'perRow' ? this.pagedRows().map(r => r.item.id) : [])

  constructor() {
    toObservable(this.service.allPromotions).pipe(
      filter(list => list.length > 0),
      switchMap(() => this.service.getPromotionDetails().pipe(catchError(() => of(null)))),
      takeUntilDestroyed(),
    ).subscribe(items => {
      // An API older than include=details answers with plain headers: no tiers on any item
      if (items && items.every(isListDetail)) {
        this.details.set(new Map(items.map(d => [d.id, d])))
        this.mode.set('bulk')
      } else {
        this.mode.set('perRow')
      }
    })

    toObservable(this.fallbackIds).pipe(
      distinctUntilChanged((a, b) => a.join() === b.join()),
      switchMap(ids => from(ids.filter(id => !this.details().has(id))).pipe(
        concatMap(id => this.service.getPromotionById(id).pipe(
          map(d => [id, toListDetail(d)] as const),
          catchError(() => of([id, null] as const)),
        )),
      )),
      takeUntilDestroyed(),
    ).subscribe(([id, d]) => this.details.update(m => new Map(m).set(id, d)))
  }

  selectSection(key: SectionKey) {
    this.activeSection.set(key)
    this.page.set(0)
  }

  setQuery(value: string) {
    this.query.set(value)
    this.page.set(0)
  }

  setStatus(value: string) {
    this.statusFilter.set(value)
    this.page.set(0)
  }

  goToPage(page: number) {
    this.page.set(Math.max(0, Math.min(page, this.pageCount() - 1)))
  }

  onClickRow(id: number) {
    this.router.navigate(['/crm-promotion', id])
  }

  memberScope(d: TPromotionListDetail): string {
    return d.isMemberSpecific && d.members.length
      ? `เฉพาะ ${d.members.map(m => m.memberName).join('/')}`
      : 'ลูกค้าทุกประเภท'
  }

  branchScope(d: TPromotionListDetail): string {
    return d.isBranchSpecific ? `${d.branchCount} สาขา` : 'ทุกสาขา'
  }

  badgeClass(badge: string | null): string {
    if (!badge) return 'text-bg-light'
    if (badge.startsWith('โปรลดราคา') || badge === 'ลดราคาชุด') return 'bg-primary-subtle text-primary-emphasis'
    if (badge.startsWith('โปรแถม')) return 'bg-warning-subtle text-warning-emphasis'
    if (badge === 'แลกซื้อ') return 'bg-info-subtle text-info-emphasis'
    if (badge === 'ซื้อครบยอด') return 'bg-success-subtle text-success-emphasis'
    return 'bg-secondary-subtle text-secondary-emphasis'
  }
}

// Name, deal, or any good the promotion names -- BU looks promotions up by product
// ("what's on Eucerin?"), as the legacy goods tab was sorted by product. In the per-row
// fallback only loaded rows can match by good.
function matches(row: PromotionRow, q: string): boolean {
  if (row.item.promotionName.toLowerCase().includes(q)) return true
  if (row.description?.deal.toLowerCase().includes(q)) return true
  const d = row.detail
  if (!d) return false
  const goods = [...d.filterList.flatMap(f => f.productList), ...d.rewardPool]
  return goods.some(g =>
    g.goodName?.toLowerCase().includes(q) || g.goodCode?.toLowerCase().includes(q) || g.sku?.toLowerCase().includes(q))
}
