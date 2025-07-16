import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { headIdHandler } from '../../lib/paramsHandler';
import { inject } from '@angular/core';
import { OiLightService } from '../../service/other-income/oi-light.service';

export const getOtherIncomeLightIdResolver: ResolveFn<boolean> = (route, state) => {
  try {
    const headId = headIdHandler(route)
    const validHead = Number(headId)
    const lightServ = inject(OiLightService)
    lightServ.fetchById(validHead)
    return true;
  } catch (err) {
    console.log(err)
    const router = inject(Router)
    return new RedirectCommand(router.parseUrl("notfound"))
  }
};
