import { computed, inject, Injectable } from '@angular/core';
import { WarehouseService } from './warehouse.service';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
<<<<<<< HEAD
import { TCreateDoorInfo, TCreateTimeSlot, TDoorDetail, TTimeSlotInfo } from '../../types/ibob-supplier.type';
import { catchError, filter, of, Subject, switchMap, throwError } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { TDuration } from './door-form.service';
=======
import { TCreateDoorInfo, TCreateTimeSlot, TDoorDetail } from '../../types/ibob-supplier.type';
import { catchError, filter, of, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
>>>>>>> 7b473f5093996e06fd3458a742f1a4cedbd08bb4

@Injectable({
  providedIn: 'root'
})
export class DoorMutationService {

  constructor() { }

  private warehouseServ = inject(WarehouseService)

  private url = environment.ibob

  private api = inject(ApiService)

  private doorId$ = new Subject<string>()

  doorId = toSignal(this.doorId$)

  setDoor(id: string) {
    this.doorId$.next(id)
  }

<<<<<<< HEAD
  private fetchDoorDetail = (DoorId: string) => {
    console.log(DoorId)
    return this.api.get<TDoorDetail>(`${this.url}/GetDoorDetail`, { params: { DoorId } })
      .pipe(catchError(err => throwError(() => err)))
  }
=======
  private fetchDoorDetail = (DoorId: string) => this.api.get<TDoorDetail>(`${this.url}/GetDoorDetail`, { params: { DoorId } })
>>>>>>> 7b473f5093996e06fd3458a742f1a4cedbd08bb4

  private doorDetail$ = this.doorId$.pipe(
    filter(id => !!id),
    switchMap(this.fetchDoorDetail)
    , catchError((err) => {
      console.error(err)
      return of(null)
    })
  )

  doorDetail = toSignal(this.doorDetail$, { initialValue: null })

  doorHead = computed(() => {
    const door = this.doorDetail()?.door
    if (!door) return null
    const { doorId, doorname, mail, note, intendant, timeUse, multiple } = door
    return {
<<<<<<< HEAD
      doorname, timeUse, note, mail, multiple: multiple === '1', intendant: intendant ?? '', doorId: Number(doorId)
=======
      doorname, timeUse, note, mail, multiple: multiple === '1'
>>>>>>> 7b473f5093996e06fd3458a742f1a4cedbd08bb4
    }
  })

  private convertToTimeStruct = (time: string): NgbTimeStruct => {
    const [hr, min, _] = time.split(':')
    return {
      hour: Number(hr),
      minute: Number(min),
      second: 0
    }
  }

<<<<<<< HEAD
  timeMap = computed(() => {
    const time = this.doorDetail()?.time ?? []
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
=======
  timeList = computed(() => {
    const time = this.doorDetail()?.time
    if (!time) return []
    return time.map(({ startTime, endTime, ...res }) => {
      if (!startTime || !endTime) return [{ ...res }]
      return [{
        ...res, form: this.convertToTimeStruct(startTime), to: this.convertToTimeStruct(endTime)
      }]
    })
>>>>>>> 7b473f5093996e06fd3458a742f1a4cedbd08bb4
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

  updateDoor = ({ door, time }: { door: TCreateDoorHeadVar, time: TCreateTimeSlot[] }) => {
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

<<<<<<< HEAD
type TCreateDoorHeadVar = Pick<TCreateDoorInfo, 'doorname' | 'intendant' | 'multiple' | 'mail' | 'note' | 'timeUse'>

type TTimeSlotTemp = Pick<TTimeSlotInfo, 'id' | 'doorId'> & TDuration
=======
type TCreateDoorHeadVar = Pick<TCreateDoorInfo, 'doorname' | 'intendant' | 'multiple' | 'mail' | 'note' | 'timeUse'>
>>>>>>> 7b473f5093996e06fd3458a742f1a4cedbd08bb4
