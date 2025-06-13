import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ToastService } from '../../service/toast/toast.service';
import { DoorMutationService } from '../../service/ibob/door-mutation.service';

export const fetchDoorDetailResolver: ResolveFn<boolean> = (route, state) => {
  const router = inject(Router)
  const toast = inject(ToastService)
  try {
    console.log('fetch')
    const doorMutServ = inject(DoorMutationService)
    let doorId = route.paramMap.get('doorId')
    console.log(doorId)
    if (!doorId) {
      const temp = route.parent?.paramMap.get('doorId')
      if (!temp) {

        toast.danger('cannot get door id from resolver')
        router.navigateByUrl('/supplier/in-out')
        return false
      }
      doorId = temp
    }
    const isNumber = parseInt(doorId)
    if (isNaN(isNumber)) {
      toast.danger('invalid warehouse id')
      router.navigateByUrl('/supplier/in-out')
      return false
    }
    console.log('set door')
    doorMutServ.setDoor(doorId)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
};
