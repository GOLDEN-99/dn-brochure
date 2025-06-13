import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TWarehouse } from '../../types/ibob-supplier.type';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  constructor() { }
  private api = inject(ApiService)
  private baseurl = environment.ibob
  private getWarehouseList = this.api.get<TWarehouse[]>(`${this.baseurl}/GetWarehouses`)
  warehouseList = toSignal(this.getWarehouseList, { initialValue: [] })
  warehouseId = signal<string | null>(null)
  warehouseId$ = toObservable(this.warehouseId).pipe(filter(r => r !== null))
  currentWarehouse = computed(() => this.warehouseList().find(({ id }) => id === this.warehouseId()))
  currentWarehouseName = computed(() => this.currentWarehouse()?.name ?? 'ไม่พบคลัง')

}
