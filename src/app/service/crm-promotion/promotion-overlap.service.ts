import { inject, Injectable } from '@angular/core';
import { from, map, mergeMap, Observable, of, toArray } from 'rxjs';
import { CrmPromotionService } from './crm-promotion.service';
import {
  TCreatePromotionRequest,
  TPromotionListDetail,
  TPromotionListItem,
} from '../../types/crm-promotion.type';
import {
  EMPTY_OVERLAP_REPORT,
  ExistingPromotion,
  isHeaderCandidate,
  needsBranchList,
  needsOverlapCheck,
  OverlapReport,
  resolveOverlaps,
  sharedProducts,
} from '../../lib/crm-promotion/promotion-overlap';

// The API host refuses bursts (CRM-PROMOTIONS.md §7b); the candidates after the screens are few
const DETAIL_CONCURRENCY = 4;

// An API older than include=details answers with plain headers: no tiers on any item
const isListDetail = (x: TPromotionListDetail | TPromotionListItem): x is TPromotionListDetail =>
  Array.isArray((x as TPromotionListDetail).tiers);

/**
 * The pre-save overlap check: which live promotions of the same kind name the goods this one
 * names, and what the till does when both are active. The rules are in
 * lib/crm-promotion/promotion-overlap.ts; this only fetches as little as the screens allow.
 *
 * One GET ?include=details narrowed to the type, then GET /:id only for a candidate the list
 * cannot settle: both sides branch-specific (the list reduces branches to a count), or an API
 * that returned headers only.
 */
@Injectable({ providedIn: 'root' })
export class PromotionOverlapService {
  private readonly crm = inject(CrmPromotionService);

  check(req: TCreatePromotionRequest, editingId?: number): Observable<OverlapReport> {
    if (!needsOverlapCheck(req)) return of(EMPTY_OVERLAP_REPORT);
    return this.crm.getPromotionDetails({ promotionType: req.promotionType, status: 'ACTIVE' }).pipe(
      mergeMap((items) => from(items.filter((i) => isHeaderCandidate(req, i, editingId)))),
      mergeMap((item) => this.load(req, item), DETAIL_CONCURRENCY),
      toArray(),
      map((loaded) =>
        resolveOverlaps(req, loaded.filter((e): e is ExistingPromotion => e !== null), editingId),
      ),
    );
  }

  private load(
    req: TCreatePromotionRequest,
    item: TPromotionListDetail | TPromotionListItem,
  ): Observable<ExistingPromotion | null> {
    if (isListDetail(item)) {
      if (sharedProducts(req, item).length === 0) return of(null);
      if (!needsBranchList(req, item)) return of(item);
    }
    return this.crm.getPromotionById(item.id);
  }
}
