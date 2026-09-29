import { Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { PromotionSourcePipe } from '../../../lib/crm-promotion/promotion-source.pipe';
import { PromotionOrderPipe } from '../../../lib/crm-promotion/promotion-order.pipe';
import { LADDER_KEYS, LADDER_LABELS, highlightedLadderCells } from '../create/item-price-import/item-price-import-ladder';
import {
  REQUEST_STATUS_LABEL,
  TItemPriceRequestDetail,
  TItemPriceRequestLine,
  isTerminalStatus,
} from '../create/item-price-import/item-price-import.types';
import { STATUS_BADGE_CLASS } from './item-price-request-list.component';

export const POLL_INTERVAL_MS = 3000

@Component({
  selector: 'app-item-price-request-detail',
  imports: [DatePipe, DecimalPipe, RouterLink, PromotionSourcePipe, PromotionOrderPipe],
  templateUrl: './item-price-request-detail.component.html',
  styleUrl: '../create/item-price-import/item-price-import.component.scss',
})
export class ItemPriceRequestDetailComponent {
  private readonly service = inject(CrmPromotionService)
  private readonly destroyRef = inject(DestroyRef)

  /** Bound from the route param by withComponentInputBinding. */
  readonly id = input<number | string>()

  readonly statusLabel = REQUEST_STATUS_LABEL
  readonly badgeClass = STATUS_BADGE_CLASS
  readonly ladderKeys = LADDER_KEYS
  readonly ladderLabels = LADDER_LABELS

  readonly detail = signal<TItemPriceRequestDetail | null>(null)
  readonly loading = signal(false)
  readonly error = signal('')
  readonly retrying = signal(false)
  /** True while a 3 s timer is armed or a poll request is in flight. */
  readonly polling = signal(false)

  readonly progressPercent = computed(() => {
    const d = this.detail()
    if (!d || d.totalCount === 0) return 0
    return Math.round(((d.issuedCount + d.skippedCount) / d.totalCount) * 100)
  })
  readonly isTerminal = computed(() => {
    const d = this.detail()
    return d ? isTerminalStatus(d.status) : false
  })

  private timer: ReturnType<typeof setTimeout> | null = null
  private inflight: Subscription | null = null

  constructor() {
    effect(() => {
      const id = Number(this.id())
      untracked(() => {
        this.stopPolling()
        this.detail.set(null)
        if (Number.isFinite(id) && id > 0) this.load(id)
      })
    })
    this.destroyRef.onDestroy(() => this.stopPolling())
  }

  /** Fetch once; if the request is still running, arm the next poll. */
  load(id: number) {
    this.inflight?.unsubscribe()
    this.loading.set(true)
    this.polling.set(true)
    this.inflight = this.service.getItemPriceRequest(id).subscribe({
      next: d => {
        this.detail.set(d)
        this.error.set('')
        this.loading.set(false)
        if (isTerminalStatus(d.status)) {
          this.polling.set(false)
        } else {
          this.timer = setTimeout(() => {
            this.timer = null
            this.load(id)
          }, POLL_INTERVAL_MS)
        }
      },
      error: () => {
        this.loading.set(false)
        this.polling.set(false)
        this.error.set('โหลดคำขอไม่สำเร็จ')
      },
    })
  }

  stopPolling() {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.inflight?.unsubscribe()
    this.inflight = null
    this.polling.set(false)
  }

  refresh() {
    const d = this.detail()
    const id = d?.id ?? Number(this.id())
    if (!Number.isFinite(id) || id <= 0) return
    this.stopPolling()
    this.load(id)
  }

  retry() {
    const d = this.detail()
    if (!d || d.status !== 'FAILED' || this.retrying()) return
    this.retrying.set(true)
    this.error.set('')
    this.service.retryItemPriceRequest(d.id).subscribe({
      next: () => {
        this.retrying.set(false)
        this.stopPolling()
        this.load(d.id)
      },
      error: (err: unknown) => {
        this.retrying.set(false)
        const msg = (err as { error?: { message?: string } })?.error?.message
        this.error.set(msg ?? 'ลองใหม่ไม่สำเร็จ')
      },
    })
  }

  highlight(line: TItemPriceRequestLine) {
    return highlightedLadderCells(line.ladder, line.price)
  }
}
