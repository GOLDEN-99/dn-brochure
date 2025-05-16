import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { combineLatest, filter, map, Subject, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TAllDayDetailReq, TAllDayDetailRes, TAppDoor, TDailyReq, TDailyRes, TDailyStatRes } from '../../types/ibob-supplier.type';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TDate } from '../../lib';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { TMaybe } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class DailyCalendarService {

  constructor() {
    const eff = effect(() => console.log(this.filterDoor()))
  }

  private api = inject(ApiService)

  calendar = inject(NgbCalendar);
  currentDate = signal<NgbDate>(this.calendar.getToday())
  private isoDate = computed(() => {
    const date = this.currentDate()
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  })

  private date$ = toObservable(this.isoDate)

  private warehosue$ = new Subject<string>()

  setWarehouse = (id: string) => this.warehosue$.next(id)

  setDate = ({ year, month, day }: TDate) => {
    console.log(year, month, day)
    const newDate = new NgbDate(year, month, day)
    this.currentDate.set(newDate)
  }

  private params = combineLatest({
    warehouseId: this.warehosue$,
    date: this.date$
  })

  private url = environment.ibob

  private getDailyResevation = (params: TDailyReq) =>
    this.api.get<TDailyRes>(`${this.url}/GetDailyTimeSlotsByDoor`, { params })
      .pipe(map(({ doors, date }) => doors.map(d => ({ ...d, date }))))

  private doors$ = this.params.pipe(switchMap(this.getDailyResevation))

  resevation = toSignal(this.doors$, { initialValue: [] })

  timeRef = computed(() => {
    const reserve = this.resevation()
    if (reserve.length === 0) return []
    return reserve[0].times.map(({ time }) => time).sort()
  })

  refArr = signal<string[]>([])

  setDoor = (doors: TAppDoor[]) => {
    const selectedDoor = doors.flatMap(({ check, name }) => check ? [name] : [])
    this.refArr.set(selectedDoor)
  }

  filterDoor = computed(
    () => this.resevation()
      .flatMap(({ door, times }) => this.refArr().includes(door)
        ? times.map(t => ({ ...t, door }))
        : [])
  )

  displayDoors = computed(() => {
    const raw = this.filterDoor()
    if (raw.length === 0) return []
    const timeRef = this.timeRef()
    const formatted = timeRef.map(t => raw.filter(r => r.time === t))
    const result = formatted.map(
      (lst) => lst.reduce<ITemp>((acc, { door, time, status }) => ({ ...acc, time, [door]: { time, status } }), { time: '00:00' })
    )
    console.table(result)
    return result
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
    warehouseId: this.warehosue$,
    door: this.doorId$
  })

  private getDetailDoorList = (params: TAllDayDetailReq) => this.api.get<TAllDayDetailRes[]>(`${this.url}/GetAllDay`, { params })

  private reservationMap$ = this.detailDoorParams.pipe(switchMap(this.getDetailDoorList))

  reseavationList = toSignal(this.reservationMap$, { initialValue: [] })
}

interface ITemp { time: string }