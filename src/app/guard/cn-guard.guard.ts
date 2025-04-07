import { CanActivateFn, Router } from '@angular/router';
import { TCnType } from '../types/cn.type';
import { inject } from '@angular/core';
import { CnRemarkService } from '../service/cn/cn-remark/cn-remark.service';

export const cnGuard = (expectedCnType: TCnType): CanActivateFn => (route, state) => {
  const remarkService = inject(CnRemarkService);
  const router = inject(Router);
  const currentCnType = remarkService.cnType();
  if (currentCnType === expectedCnType) return true;
  try {
    const saleCode = route.parent?.paramMap.get('saleCode');
    const wholeCode = route.parent?.paramMap.get('wholeCode');
    const wholeNumb = route.parent?.paramMap.get('wholeNumb');
    if (!saleCode || !wholeCode || !wholeNumb) throw new Error('invalid params')
    return router.createUrlTree([`/cn/${saleCode}/${wholeCode}/${wholeNumb}`]);
  } catch (err) {
    return router.navigateByUrl('notfound')
  }
}