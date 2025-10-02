import { ResolveFn } from '@angular/router';
import { compCodeHandler } from '../../lib/paramsHandler';
import { inject } from '@angular/core';
import { SupplierApiService } from '../../service/supplier/supplier-api.service';

export const supplierCompResolver: ResolveFn<boolean> = (route, state) => {
  try {
    const compCode = compCodeHandler(route)
    const compService = inject(SupplierApiService)
    compService.getCompInfoById(compCode)
    return true;
  } catch (err) {
    console.log(err)
    return false
  }
};
