import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { paramsHandler } from '../../lib/paramsHandler';
import { predicateNumber } from '../../lib/predicate';
import { inject } from '@angular/core';
import { OiNotLightDualService } from '../../service/other-income/oi-not-light-dual.service';

const dualPairIdHandler = paramsHandler('dualPairId')(predicateNumber)

export const getOtherIncomeNotLightDualIdResolver: ResolveFn<boolean> = (route) => {
  try {
    const pairId = Number(dualPairIdHandler(route))
    inject(OiNotLightDualService).fetchById(pairId)
    return true;
  } catch (err) {
    console.log(err)
    return new RedirectCommand(inject(Router).parseUrl('notfound'))
  }
};
