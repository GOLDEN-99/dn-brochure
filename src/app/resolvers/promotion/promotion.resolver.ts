import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { TItemList } from '../../types';
import { catchError, EMPTY } from 'rxjs';
import { ToastService } from '../../service/toast/toast.service';
import { promoHandler } from '../../lib';
import { wholeCodeHandler } from '../../lib/paramsHandler';
import { ProchureService } from '../../service/brochure/prochure/prochure.service';

export const promotionResolver: ResolveFn<TItemList> = (route, state) => {
  const router = inject(Router)
  const toast = inject(ToastService)
  try {
    const promotionService = inject(ProchureService)
    const promoType = promoHandler(route)
    const wholeCode = wholeCodeHandler(route)

    return promotionService.getProchureList(wholeCode, promoType).pipe(catchError(() => {
      toast.danger(`ไม่พบร้าน ${wholeCode}`)
      return EMPTY
    }))
  } catch (err) {
    toast.danger("ไม่สามารถค้นหาร้านได้");
    return new RedirectCommand(router.parseUrl(""))
  }
};
