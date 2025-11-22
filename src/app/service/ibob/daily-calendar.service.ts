import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { combineLatest, filter, map, Subject, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TAllDayDetailReq, TAllDayDetailRes, TAppDoor, TDailyReq, TDailyRes, TDailyStatRes } from '../../types/ibob-supplier.type';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TDate } from '../../lib';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { TMaybe } from '../../types';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class DailyCalendarService {


  private api = inject(ApiService)

  calendar = inject(NgbCalendar);
  currentDate = signal<NgbDate>(this.calendar.getToday())
  private isoDate = computed(() => {
    const date = this.currentDate()
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  })
  private warehouseServ = inject(WarehouseService)

  private date$ = toObservable(this.isoDate)


  setDate = ({ year, month, day }: TDate) => {
    const newDate = new NgbDate(year, month, day)
    this.currentDate.set(newDate)
  }

  private params = combineLatest({
    warehouseId: this.warehouseServ.warehouseId$,
    date: this.date$
  })

  private url = environment.ibob

  private getDailyResevation = (params: TDailyReq) =>
    this.api.get<TDailyRes>(`${this.url}/GetDailyTimeSlotsByDoor`, { params })
      .pipe(
        map(
          ({ doors, date }) => doors
            .map(({ times, ...res }) => ({
              ...res, date,
              times: times.map(({ time, status }) => ({
                timeStatus: status, time,
                min: time.split(':').map(Number)
                  .reduce((acc, cur, i) => acc + (cur * Math.pow(60, 1 - i)), 0)
              }))
            }))
        )
      )

  private doors$ = this.params.pipe(switchMap(this.getDailyResevation))

  resevation = toSignal(this.doors$, { initialValue: [] })

  timeRef = computed(() => {
    const reserve = this.resevation()
    if (reserve.length === 0) return []
    return reserve[0].times.map(({ time, min }) => ({ time, min })).sort((a, b) => a.min - b.min)
  })



  refArr = signal<Array<{ doorId: string, name: string }>>([])

  setDoor = (doors: TAppDoor[]) => {
    const selectedDoor = doors.flatMap(({ check, name, doorId }) => check ? [({ doorId, name })] : [])
    this.refArr.set(selectedDoor)
  }

  filterDoor = computed(
    () => {
      const refs = this.refArr()
      return this.resevation()
        .filter(
          ({ doorId }) => refs
            .some(ref => ref.doorId == String(doorId))
        )
    }
  )

  displayDoors = computed(() => {
    const raw = this.filterDoor()
    if (raw.length === 0) return []
    const flatRaw = raw.flatMap(({ times, doorId }) => times.map(t => ({ ...t, doorId: String(doorId) })))
    const timeRef = this.timeRef()
    return timeRef.map(
      ({ time, min }) => ({
        time, min,
        ...flatRaw.flatMap((fl) => fl.time === time ? [fl] : []).reduce((acc, { doorId, timeStatus }) => ({ ...acc, [doorId]: timeStatus }), {})
      })
    )
    // return this.refArr()
    //   .map(ref => raw.flatMap(
    //     ({ doorId, ...res }) => ref.doorId === String(doorId) ? [{ doorId, ...res }] : []
    //   ))
    //   .map(
    //     (lst) => lst.reduce((acc, { door, time, timeStatus }) => ({ ...acc, time, [door]: { time, timeStatus } }), { time: '00:00' })
    //   )
  })

  private getDoorStatus = (params: TDailyReq) =>
    this.api.get<TDailyStatRes>(`${this.url}/GetDoorStatusByDateAndWarehouse`, { params })
      .pipe(map(({ doors }) => doors))

  private doorStat$ = this.params.pipe(switchMap(this.getDoorStatus))

  allDoorStat = toSignal(this.doorStat$, { initialValue: [] })

  doorId = signal<TMaybe<string>>(null)
  doorName = signal<TMaybe<string>>(null)

  setDoorId = (id: string, name: string) => { this.doorId.set(id); this.doorName.set(name) }

  private doorId$ = toObservable(this.doorId).pipe(filter((id) => id !== null))

  private detailDoorParams = combineLatest({
    date: this.date$,
    warehouseId: this.warehouseServ.warehouseId$,
    door: this.doorId$
  })

  private getDetailDoorList = (params: TAllDayDetailReq) => this.api.get<TAllDayDetailRes[]>(`${this.url}/GetAllDay`, { params })

  private reservationMap$ = this.detailDoorParams.pipe(
    switchMap(this.getDetailDoorList),
    map(res => res.map(
      ({ reservationTime, ...res }) => ({
        ...res, reservationTime,
        min: reservationTime.split(':').reduce((acc, cur, i) => acc + (Number(cur) * Math.pow(60, 1 - i)), 0)
      })))
  )

  reseavationList = toSignal(this.reservationMap$, { initialValue: [] })
}

interface ITemp { time: string }