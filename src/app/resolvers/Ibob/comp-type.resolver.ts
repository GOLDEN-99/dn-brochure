import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { IbobCompService } from '../../service/supplier/ibob-comp.service';
import { compTypeHandler } from '../../lib/paramsHandler';
import { SupplierApiService } from '../../service/supplier/supplier-api.service';

export const compTypeResolver: ResolveFn<boolean | RedirectCommand> = (route, state) => {

  const compService = inject(IbobCompService)
  try {
    const compType = compTypeHandler(route)
    const ibobApi = inject(SupplierApiService)
    // compService.setCompType(compType)
    ibobApi.setCompType(compType)
    return true;
  } catch (err) {
    console.log(err)
    const router = inject(Router)
    return new RedirectCommand(router.parseUrl("notfound"))
  }
};
