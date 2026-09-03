import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { PromotionBenefitNamePipe } from '../../../lib/crm-promotion/promotion-benefit-name.pipe';
import { PromotionThresholdPipe } from '../../../lib/crm-promotion/promotion-threshold.pipe';
import { PromotionPriorityPipe } from '../../../lib/crm-promotion/promotion-priority.pipe';
import { PromotionOrderPipe } from '../../../lib/crm-promotion/promotion-order.pipe';
import { PromotionSourcePipe } from '../../../lib/crm-promotion/promotion-source.pipe';
import { isPromotionSourceInferred, resolvePromotionSource } from '../../../lib/crm-promotion/resolve-promotion-source';

@Component({
  selector: 'app-promotion-detail',
  imports: [DatePipe, RouterLink, PromotionPriorityPipe, PromotionSourcePipe, PromotionOrderPipe, PromotionBenefitNamePipe, PromotionThresholdPipe],
  templateUrl: './promotion-detail.component.html',
})
export class PromotionDetailComponent {
  private readonly service = inject(CrmPromotionService)

  id = input<number>()

  private readonly refetch = signal(0)

  private readonly detail$ = combineLatest([
    toObservable(this.id),
    toObservable(this.refetch),
  ]).pipe(
    filter(([id]) => !!id),
    switchMap(([id]) => this.service.getPromotionById(id!))
  )
  detail = toSignal(this.detail$, { initialValue: null })

  // The API never persists `source`, so for anything created since 2026-05-13 the
  // detail page has nothing to render. Show the same value the edit form will open
  // with, flagged as inferred so nobody reads it as the stored owner.
  readonly resolvedSource = computed(() => {
    const d = this.detail()
    if (!d) return null
    return {
      value: resolvePromotionSource(d.source, d.promotionOrder),
      inferred: isPromotionSourceInferred(d.source),
    }
  })

  toggling = signal(false)

  toggleStatus() {
    const d = this.detail()
    if (!d || this.toggling()) return
    const next = d.promotionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    this.toggling.set(true)
    this.service.togglePromotionStatus(d.id, next).subscribe({
      next: () => {
        this.refetch.update(v => v + 1)
        this.service.refetchPromotions()
        this.toggling.set(false)
      },
      error: () => this.toggling.set(false),
    })
  }
}
