import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { environment } from '../../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, filter, of, Subject, switchMap, tap } from 'rxjs';
import { IIbObComp, IIbObLogin, IIbObReserve } from '../ibobToken';
import { TComp, TDoor, TDoorMap, TLoginReq, TLoginRes } from '../../../types/ibob-supplier.type';
import { TDate } from '../../../lib';
import { TMaybe } from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class LoginService implements IIbObLogin, IIbObComp, IIbObReserve {

  constructor() { }

  private api = inject(ApiService)
  private baseurl = environment.ibob

  currentComp = signal<TMaybe<TComp>>(null)
  currentDoorMap = signal<TDoorMap>({})
  currentWarehouse = signal<TMaybe<string>>(null)
  currentDoorList = computed(() => {
    const map = this.currentDoorMap()
    const warehouse = this.currentWarehouse()
    if (!warehouse) return []
    return map[warehouse] ?? []
  })

  private mapDoorHandler = (acc: TDoorMap, cur: TDoor) => {
    const warehouse = acc[cur.warehouseId]
    if (!warehouse) {
      return { ...acc, [cur.warehouseId]: [cur] }
    }
    return { ...acc, [cur.warehouseId]: [...warehouse, cur] }
  }


  private loginHandler = ({ comp, door }: TLoginRes) => {
    this.currentComp.set(comp)
    const doorMap = door.reduce(this.mapDoorHandler, {})
    this.currentDoorMap.set(doorMap)
  }

  login(req: TLoginReq) {
    return this.api.post<TLoginRes>(`${this.baseurl}/compSingIn`, req)
      .pipe(tap(this.loginHandler))
  }

  getCompInfo() {
    return this.api.get<boolean[]>(`${this.baseurl}/GetCompInfo`)
  }

  compList = toSignal(this.getCompInfo(), { initialValue: [] })

  compCode$ = new Subject<string>()
  getStockOrder(term: string) {
    return this.api.get<string[]>(`${this.baseurl}/GetStockOrder/${term}`)
  }
  stockOrderList$ = this.compCode$.pipe(
    filter(serach => !!(serach.trim())),
    switchMap((serach) => this.getStockOrder(serach))
  )
  stockList = toSignal(this.stockOrderList$, { initialValue: [] })

  createReserve(req: {}) {
    return this.api.post(`${this.baseurl}/CreateReservation`, req)
  }

  private gate$ = new Subject<string>()
  private selectDate$ = new Subject<string>()
  private params$ = combineLatest([this.gate$, this.selectDate$])
  private getTimeSlot = (gate: string, iso: string) => {
    console.log('call')
    return this.api
      .get<string[]>(`${this.baseurl}/GetInBound/${gate}/${iso}`)
      .pipe(
        catchError((err) => { console.log(err); return of([] as string[]); })
      )
  }
  changeGate(gate: string) {
    this.gate$.next(gate)
  }
  changeDate({ day, month, year }: TDate) {
    const isoDate = `${year}-${month}-${day}`
    this.selectDate$.next(isoDate)
  }
  private posibleSlot$ = this.params$.pipe(switchMap(([gate, date]) => this.getTimeSlot(gate, date)))
  possibleSlot = toSignal(this.posibleSlot$, { initialValue: [] })
}

