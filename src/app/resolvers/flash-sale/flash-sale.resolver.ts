import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { idPromotionHandler } from '../../lib';
import { zoneHandler } from '../../lib/paramsHandler';
import { FlashSaleService } from '../../service/brochure/flash-sale/flash-sale.service';

export const flashSaleResolver: ResolveFn<boolean> = (route, state) => {
  try {
    const idPromotion = idPromotionHandler(route)
    const zone = zoneHandler(route)
    const fsService = inject(FlashSaleService)
    fsService.search({ idPromotion, zone })
    return true;
  } catch (err) {
    console.log(err)
    const router = inject(Router)
    return new RedirectCommand(router.parseUrl("notfound"))
  }
};
