import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ToastService } from '../../service/toast/toast.service';
import { IbobAddService } from '../../service/ibob/reserve/ibob-add.service';

export const getByWarehouseResolver: ResolveFn<boolean> = (route, state) => {
  const router = inject(Router)
  const toast = inject(ToastService)
  try {
    const serv = inject(IbobAddService)
    const warehouseId = route.paramMap.get('end')
    if (!warehouseId) throw new Error('cannot get warehouse id from resolver')
    serv.setWarehouseId(warehouseId)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
};
