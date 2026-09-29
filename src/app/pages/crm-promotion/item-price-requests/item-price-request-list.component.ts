import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { PromotionSourcePipe } from '../../../lib/crm-promotion/promotion-source.pipe';
import { REQUEST_STATUS_LABEL, TItemPriceRequestStatus, TItemPriceRequestSummary } from '../create/item-price-import/item-price-import.types';

export const STATUS_BADGE_CLASS: Record<TItemPriceRequestStatus, string> = {
  QUEUED: 'bg-secondary',
  ISSUING: 'bg-primary',
  ISSUED: 'bg-success',
  ISSUED_WITH_SKIPS: 'bg-warning text-dark',
  FAILED: 'bg-danger',
}

@Component({
  selector: 'app-item-price-request-list',
  imports: [DatePipe, RouterLink, PromotionSourcePipe],
  templateUrl: './item-price-request-list.component.html',
})
export class ItemPriceRequestListComponent {
  private readonly service = inject(CrmPromotionService)

  readonly statusLabel = REQUEST_STATUS_LABEL
  readonly badgeClass = STATUS_BADGE_CLASS

  readonly loading = signal(true)
  readonly error = signal('')

  private readonly refetchSig = signal(0)
  private readonly requests$ = toObservable(this.refetchSig).pipe(
    tap(() => { this.loading.set(true); this.error.set('') }),
    switchMap(() =>
      this.service.listItemPriceRequests().pipe(
        catchError(() => {
          this.error.set('โหลดรายการคำขอไม่สำเร็จ')
          return of([] as TItemPriceRequestSummary[])
        }),
      ),
    ),
    tap(() => this.loading.set(false)),
  )
  /** Newest first, as the API returns it. */
  readonly requests = toSignal(this.requests$, { initialValue: [] as TItemPriceRequestSummary[] })

  refetch() {
    this.refetchSig.update(v => v + 1)
  }
}
