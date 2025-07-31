import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ToastService } from '../../service/toast/toast.service';
import { DoorService } from '../../service/ibob/door.service';
import { DailyCalendarService } from '../../service/ibob/daily-calendar.service';
import { WarehouseService } from '../../service/ibob/warehouse.service';

export const getByWarehouseResolver: ResolveFn<boolean> = (route, state) => {
  const router = inject(Router)
  const toast = inject(ToastService)
  try {
    const warehosuServ = inject(WarehouseService)
    const serv = inject(DoorService)
    const dailyServ = inject(DailyCalendarService)
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
    warehosuServ.warehouseId.set(warehouseId)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
};
