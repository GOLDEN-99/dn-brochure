import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ToastService } from '../../service/toast/toast.service';
import { DoorService } from '../../service/ibob/door.service';

export const getByWarehouseResolver: ResolveFn<boolean> = (route, state) => {
  const router = inject(Router)
  const toast = inject(ToastService)
  try {
    const serv = inject(DoorService)
    const warehouseId = route.paramMap.get('warehouse')
    if (!warehouseId) {
      toast.danger('cannot get warehouse id from resolver')
      router.navigateByUrl('/supplier/reserve')
      return false
    }
    const isNumber = parseInt(warehouseId)
    if (isNaN(isNumber)) {
      toast.danger('invalid warehouse id')
      router.navigateByUrl('/supplier/reserve')
      return false
    }
    serv.setWarehouseId(warehouseId)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
};
