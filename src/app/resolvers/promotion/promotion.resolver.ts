import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { ProchureService } from '../../service/prochure/prochure.service';
import { TItemList } from '../../types';
import { promoTypValidator } from '../../validator';
import { catchError, EMPTY } from 'rxjs';
import { ToastService } from '../../service/toast/toast.service';

export const promotionResolver: ResolveFn<TItemList> = (route, state) => {
  const promotionService = inject(ProchureService)
  const router = inject(Router)
  const toast = inject(ToastService)
  const promoType = route.paramMap.get('promoType')
  const wholeCode = route.paramMap.get('wholeCode')
  if (!promoType || !wholeCode) {
    toast.danger("ไม่สามารถค้นหาร้านได้");
    return new RedirectCommand(router.parseUrl(""))
  }
  try {
    if (!promoTypValidator(promoType)) {
      throw new Error('valid')
    }
    return promotionService.getProchureList(wholeCode, promoType).pipe(catchError(() => {
      toast.danger(`ไม่พบร้าน ${wholeCode}`)
      return EMPTY
    }))
  } catch (err) {
    console.log('cannot prase url at promotonal reslover fn')
    toast.danger("ไม่สามารถค้นหาร้านได้");
    return new RedirectCommand(router.parseUrl(""))
  }
};
