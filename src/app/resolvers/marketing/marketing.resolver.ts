import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { idPromotionHandler, isBkkHandler, isNewHandler, promoHandler, tokenHandler, wholeHandler } from '../../lib';
import { inject } from '@angular/core';
import { MarketingService } from '../../service/marketing/marketing.service';
import { TItemList } from '../../types';

export const marketingResolver: ResolveFn<TItemList> = (route, state) => {
  try {

    const promoType = promoHandler(route)
    const isBkk = isBkkHandler(route)
    const isNewCustomer = isNewHandler(route)
    const token = tokenHandler(route)
    const wholeType = wholeHandler(route)
    const idPromotion = idPromotionHandler(route)
    const marketing = inject(MarketingService)
    return marketing.getBrochureList({ promoType, isBkk, isNewCustomer, token, wholeType, idPromotion })
  } catch (err) {
    console.log(err)
    const router = inject(Router)
    return new RedirectCommand(router.parseUrl("notfound"))
  }
};
