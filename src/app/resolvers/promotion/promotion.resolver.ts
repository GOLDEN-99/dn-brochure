import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { ProchureService } from '../../service/prochure/prochure.service';
import { TItemList } from '../../types';
import { promoTypValidator } from '../../validator';
import { catchError, EMPTY } from 'rxjs';
import { ToastService } from '../../service/toast/toast.service';
import { promoHandler, wholeHandler } from '../../lib';
import { wholeCodeHandler } from '../../lib/paramsHandler';

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
    console.log(err)
    console.log('cannot prase url at promotonal reslover fn')
    toast.danger("ไม่สามารถค้นหาร้านได้");
    return new RedirectCommand(router.parseUrl(""))
  }
};
