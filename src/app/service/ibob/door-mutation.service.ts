import { computed, inject, Injectable } from '@angular/core';
import { WarehouseService } from './warehouse.service';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { TCreateDoorInfo, TCreateTimeSlot, TDoorDetail, TTimeSlotInfo } from '../../types/ibob-supplier.type';
import { BehaviorSubject, catchError, filter, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { TDuration } from './baseDoorForm';
@Injectable({
  providedIn: 'root'
})
export class DoorMutationService {

  constructor() { }

  private warehouseServ = inject(WarehouseService)

  private url = environment.ibob

  private api = inject(ApiService)

  private doorId$ = new BehaviorSubject<string | null>(null)

  private predicateNull = <T>(value: T | null): value is T => value !== null

  private nonNullDoor$ = this.doorId$.pipe(filter(this.predicateNull))

  doorId = toSignal(this.nonNullDoor$, { initialValue: null })

  setDoor(id: string) {
    this.doorId$.next(id)
  }

  private fetchDoorDetail = (DoorId: string) => {
    return this.api.get<TDoorDetail>(`${this.url}/GetDoorDetail`, { params: { DoorId } })
      .pipe(catchError(err => throwError(() => err)))
  }

  private doorDetail$ = this.doorId$.pipe(
    filter(this.predicateNull),
    switchMap(this.fetchDoorDetail)
    , catchError((err) => {
      console.error(err)
      return of(null)
    })
  )

  sharedDoor$ = this.doorDetail$.pipe(shareReplay(1))

  doorHead$ = this.sharedDoor$.pipe(map(d => {
    const door = d?.door
    if (!door) return null
    const { doorId, doorname, mail, note, intendant, timeUse, multiple, maxBox, minBox } = door
    return {
      doorname, timeUse, note, mail, multiple: multiple === '1', intendant: intendant ?? '', doorId: Number(doorId), maxBox, minBox
    }
  }))

  doorHead = toSignal(this.doorHead$, { initialValue: null })

  time$ = this.sharedDoor$.pipe(map(d => d?.time ?? []))

  private rawTimeList = toSignal(this.time$, { initialValue: [] })

  private doorDetail = toSignal(this.doorDetail$, { initialValue: null })

  private convertToTimeStruct = (time: string): NgbTimeStruct => {
    const [hr, min, _] = time.split(':')
    return {
      hour: Number(hr),
      minute: Number(min),
      second: 0
    }
  }

  createTimeMap = (times: TTimeSlotInfo[]) => {
    const timeMap = new Map<number, Array<TTimeSlotTemp>>()
    times.forEach(({ startTime, endTime, dayId, doorId, id }) => {
      const value = timeMap.get(dayId)
      if (!startTime || !endTime) return
      if (!value) {
        timeMap.set(dayId, [{ form: this.convertToTimeStruct(startTime), to: this.convertToTimeStruct(endTime), doorId, id }])
        return
      }
      const newValue = [...value, { form: this.convertToTimeStruct(startTime), to: this.convertToTimeStruct(endTime), doorId, id }]
      timeMap.set(dayId, newValue)
    })
    return timeMap
  }

  timeMap = computed(() => {
    const time = this.rawTimeList()
    const timeMap = new Map<number, Array<TTimeSlotTemp>>()
    time.forEach(({ startTime, endTime, dayId, doorId, id }) => {
      const value = timeMap.get(dayId)
      if (!startTime || !endTime) return
      if (!value) {
        timeMap.set(dayId, [{ form: this.convertToTimeStruct(startTime), to: this.convertToTimeStruct(endTime), doorId, id }])
        return
      }
      const newValue = [...value, { form: this.convertToTimeStruct(startTime), to: this.convertToTimeStruct(endTime), doorId, id }]
      timeMap.set(dayId, newValue)
    })
    return timeMap
  })

  createDoor = ({ door, time }: { door: TCreateDoorHeadVar, time: TCreateTimeSlot[] }) => {
    const whname = this.warehouseServ.currentWarehouseName()
    const warehouseId = this.warehouseServ.warehouseId()
    if (!warehouseId) throw new Error('invalid warehouse')
    return this.api.post(`${this.url}/CreateGate`, {
      door: {
        ...door, whname, warehouseId
      },
      time
    }, {})
  }

  updateDoor = ({ door, time }: TEditDoorReq) => {
    const whname = this.warehouseServ.currentWarehouseName()
    const warehouseId = this.warehouseServ.warehouseId()
    if (!warehouseId) throw new Error('invalid warehouse')
    return this.api.post(`${this.url}/UpdateGate`, {
      door: {
        ...door, whname, warehouseId
      },
      time
    }, {})
  }
}

type TCreateDoorHeadVar = Pick<TCreateDoorInfo, 'doorname' | 'intendant' | 'multiple' | 'mail' | 'note' | 'timeUse'>

type TTimeSlotTemp = Pick<TTimeSlotInfo, 'id' | 'doorId'> & TDuration
