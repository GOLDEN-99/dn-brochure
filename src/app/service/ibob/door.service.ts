import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, of, Subject, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TAppDoor, TDoor } from '../../types/ibob-supplier.type';

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

  private url = environment.ibob

  private api = inject(ApiService)

  private warehouse$ = new Subject<string>()

  private fetchDoor = (warehouseId: string) => this.api.get<TDoor[]>(`${this.url}/GetDoor`, { params: { warehouseId } })

  private door$ = this.warehouse$.pipe(
    switchMap(this.fetchDoor),
    map((door) => door.map(d => ({ ...d, check: true }))),
    catchError((err) => { return of([] as TAppDoor[]) })
  )

  doorList = signal<TAppDoor[]>([])

  selectedDoor = computed(() => this.doorList().filter(({ check }) => check))

  toggleDoor = (doorId: string) => this.doorList.update(
    prev => prev.map(
      (p) => p.doorId === doorId ? ({ ...p, check: !p.check }) : p
    )
  )

  setWarehouseId = (id: string) => this.warehouse$.next(id)
}
