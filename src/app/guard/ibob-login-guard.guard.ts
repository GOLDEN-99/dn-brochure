import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IbobAddService } from '../service/ibob/ibob-add.service';

export const ibobLoginGuardGuard: CanActivateFn = (route, state) => {
  const login = inject(IbobAddService)
  if (login.isLogin()) return true
  const compCode = route.queryParamMap.get('compCode')
  // load save data
  const compType = route.parent?.paramMap.get('compType')
  const normalizeCompType = compType?.toLocaleLowerCase()
  if (typeof normalizeCompType !== 'string') return false
  // load save data
  login.loadCompData(normalizeCompType, compCode)
  if (login.isLogin()) return true
  // redirect to login
  const router = inject(Router)
  const redirect = route.url
  return router.navigate(['supplier', 'reserve', 'login'], { queryParams: { redirect, compCode } })
};
