import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { PromotionBenefitNamePipe } from '../../../lib/crm-promotion/promotion-benefit-name.pipe';
import { PromotionThresholdPipe } from '../../../lib/crm-promotion/promotion-threshold.pipe';

@Component({
  selector: 'app-promotion-detail',
  imports: [DatePipe, RouterLink, PromotionBenefitNamePipe, PromotionThresholdPipe],
  templateUrl: './promotion-detail.component.html',
})
export class PromotionDetailComponent {
  private readonly service = inject(CrmPromotionService)

  id = input<number>()

  private readonly detail$ = toObservable(this.id).pipe(
    filter((id): id is number => !!id),
    switchMap(id => this.service.getPromotionById(id))
  )
  detail = toSignal(this.detail$, { initialValue: null })
}
