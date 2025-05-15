import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { combineLatest, map, Subject, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TAppDoor, TDailyReq, TDailyRes } from '../../types/ibob-supplier.type';
import { toSignal } from '@angular/core/rxjs-interop';
import { TDate } from '../../lib';

@Injectable({
  providedIn: 'root'
})
export class DailyCalendarService {

  constructor() { }

  private api = inject(ApiService)

  private date$ = new Subject<string>()

  private warehosue$ = new Subject<string>()

  setWarehouse = (id: string) => this.warehosue$.next(id)

  setDate = ({ year, month, day }: TDate) => {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    this.date$.next(iso)
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

  private filterDoor = computed(
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
}

interface ITemp { time: string }