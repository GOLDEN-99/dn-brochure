import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, map, of, switchMap, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TAppDoor, TDoor } from '../../types/ibob-supplier.type';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class DoorService {

  constructor() {
    this.door$.pipe(takeUntilDestroyed()).subscribe({
      next: (doors) => this.doorList.set(doors),
      error: (err) => {
        console.log(err);
        this.doorList.set([])
      }
    })
  }

  private warehouseServ = inject(WarehouseService)

  private url = environment.ibob

  private api = inject(ApiService)

  private fetch$ = new BehaviorSubject('fetch')

  private fetchDoor = (warehouseId: string) => this.api.get<TDoor[]>(`${this.url}/GetDoor`, { params: { warehouseId } })

  private door$ =
    this.fetch$.pipe(
      switchMap(() => this.warehouseServ.warehouseId$.pipe(
        switchMap(this.fetchDoor),
        map((door) => door.map(d => ({ ...d, check: true }))),
        catchError((err) => throwError(() => err))
      )),
      catchError((err) => of([] as TAppDoor[]))
    )

  doorList = signal<TAppDoor[]>([])

  selectedDoor = computed(() => this.doorList().filter(({ check }) => check))

  toggleDoor = (doorId: string) => this.doorList.update(
    prev => prev.map(
      (p) => p.doorId === doorId ? ({ ...p, check: !p.check }) : p
    )
  )

  whname = this.warehouseServ.currentWarehouseName

  refetch = () => this.fetch$.next('fetch')

}


