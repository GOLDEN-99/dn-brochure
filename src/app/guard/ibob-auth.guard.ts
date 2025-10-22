import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { IbobAddService } from '../service/ibob/ibob-add.service';

export const ibobAuthGuard: CanActivateChildFn = (childRoute, state) => {
  const subpath = childRoute.url
  // allow if is login
  if (subpath[0]?.path === 'login') return true
  const login = inject(IbobAddService)
  // check is login
  if (login.isLogin()) return true
  // try get saved login
  const compCode = childRoute.queryParamMap.get('compCode')
  const compType = childRoute.parent?.paramMap.get('compType')
  const normalizeCompType = compType?.toLocaleLowerCase()
  if (typeof normalizeCompType !== 'string') return false
  // load save data
  login.loadCompData(normalizeCompType, compCode)
  // recheck is login
  if (login.isLogin()) return true
  // redirect to login
  const router = inject(Router)
  const redirect = state.url.split('/')
  return router.navigate([redirect[0], redirect[1], redirect[2], redirect[3], 'login'], { queryParams: { redirect, compCode } })
};
