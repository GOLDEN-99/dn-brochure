import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { IbobAddService } from '../../service/ibob/ibob-add.service';

export const ibobLocalCompResolver: ResolveFn<boolean> = (route, state) => {
  console.log('resolver')
  const compCode = route.queryParamMap.get('compCode')
  const ibobApi = inject(IbobAddService)
  const isLogin = ibobApi.isLogin()
  console.log(compCode)
  if (!isLogin) {
    ibobApi.loadCompData(compCode)
  }
  return true;
};
