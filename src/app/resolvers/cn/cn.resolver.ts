import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { TMaybe } from '../../types';
import { TWholeItem } from '../../types/cn.type';
import { saleCodeHandler, wholeCodeHandler, wholeNumbHandler } from '../../lib/paramsHandler';
import { ToastService } from '../../service/toast/toast.service';
import { CnApiService } from '../../service/cn/cn-api/cn-api.service';

export const cnResolver: ResolveFn<TMaybe<TWholeItem>> = (route, state) => {
  const router = inject(Router)
  const cnApi = inject(CnApiService)
  const toast = inject(ToastService)
  try {
    const wholeCode = wholeCodeHandler(route)
    const wholeNumb = wholeNumbHandler(route)
    const saleCode = saleCodeHandler(route)
    return cnApi.getWholeItem({ wholeCode, wholeNumb, saleCode })
  } catch (err) {
    toast.danger("ไม่สามารถค้นหาร้านได้");
    return new RedirectCommand(router.parseUrl("notfound"))
  }
};
