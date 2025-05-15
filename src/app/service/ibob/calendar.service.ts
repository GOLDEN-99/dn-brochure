import { computed, inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TAppDoor, TAppWeeklyList, TSlotReady, TWeeklyReq, TWeeklyRes } from '../../types/ibob-supplier.type';
import { environment } from '../../../environments/environment';
import { catchError, combineLatest, concat, filter, Subject, switchMap, tap, throwError } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TDate } from '../../lib';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor() { }

  private api = inject(ApiService)

  private url = environment.ibob

  private startDate$ = new Subject<string>()

  private endDate$ = new Subject<string>()

  private doors$ = new Subject<string[]>()

  private getWeekly = ({ startDate, endDate, doors }: TWeeklyReq) => this.api.post<TWeeklyRes[]>(`${this.url}/GetWeeklyTimeSlots`, doors, { params: { startDate, endDate } })

  private params$ = combineLatest({
    startDate: this.startDate$,
    endDate: this.endDate$,
    doors: this.doors$
  }).pipe();

  private result$ = this.params$.pipe(
    tap(console.log),
    switchMap(this.getWeekly),
    catchError(err => throwError(() => err))
  );

  weeklyReservation = toSignal(this.result$, { initialValue: [] })

  displayWeekly = computed(() => this.mapWeekToCalendar(this.weeklyReservation()))

  header = computed(() => this.weeklyReservation().map(({ date }) => {
    const [yyyy, mm, dd] = date.split('-').map(Number)
    return `${dd}/${mm}/${yyyy}`
  }))

  private dateToIso = ({ year, month, day }: TDate) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  private mapWeekToCalendar = (res: TWeeklyRes[]): TAppWeeklyList => {
    if (res.length !== 7) return []
    const timeRef = res[0].times.map(({ time }) => time)
    const formatted = timeRef.map((r) => res.map(({ date, times }) => {
      const selectedValue = times.find(t => t.time === r)
      if (!selectedValue) {
        return { time: r, status: 0, date }
      }
      return { ...selectedValue, date }
    }))

    return formatted
  }

  setWeek = ({ start, end }: TRawDate) => {
    console.log('set range')
    if (start) {
      this.startDate$.next(this.dateToIso(start))
    }
    if (end) {
      this.endDate$.next(this.dateToIso(end))
    }
  }

  setDoor = (doors: TAppDoor[]) => {
    console.log('set door')
    const selectedDoor = doors.flatMap(({ check, doorId }) => check ? [doorId] : [])
    this.doors$.next(selectedDoor)
  }

}

type TRawDate = { start: TDate | null; end: TDate | null }