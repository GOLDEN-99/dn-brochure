import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { StockItemApiService } from '../../service/stock-item/stock-item-api.service';

export const stockSetupResolver: ResolveFn<boolean> = (route, state) => {
  const stockServ = inject(StockItemApiService)
  stockServ.refreshSetup();
  return true;
};
