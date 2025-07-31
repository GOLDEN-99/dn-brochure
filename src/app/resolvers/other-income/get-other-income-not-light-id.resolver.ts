import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { headIdHandler } from '../../lib/paramsHandler';
import { inject } from '@angular/core';
import { OiNotLightService } from '../../service/other-income/oi-not-light.service';

export const getOtherIncomeNotLightIdResolver: ResolveFn<boolean> = (route, state) => {
  try {
    const qString = route.queryParams as any
    const compType = qString?.compType
    const headId = headIdHandler(route)
    const validHead = Number(headId)
    const lightServ = inject(OiNotLightService)
    lightServ.fetchById(validHead, compType)
    return true;
  } catch (err) {
    console.log(err)
    const router = inject(Router)
    return new RedirectCommand(router.parseUrl("notfound"))
  }
};
