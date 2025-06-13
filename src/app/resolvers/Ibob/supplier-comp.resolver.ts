import { ResolveFn } from '@angular/router';
import { compCodeHandler } from '../../lib/paramsHandler';
import { inject } from '@angular/core';
import { SUPPLIER_TOKEN } from '../../service/supplier/supplier.token';

export const supplierCompResolver: ResolveFn<boolean> = (route, state) => {
  try {
    const compCode = compCodeHandler(route)
    const compService = inject(SUPPLIER_TOKEN)
    compService.searchCompCode(compCode)
    return true;
  } catch (err) {
    console.log(err)
    return false
  }
};
