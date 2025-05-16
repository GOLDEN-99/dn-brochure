import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TAppDoor, TAppWeeklyList, TWeeklyReq, TWeeklyRes } from '../../types/ibob-supplier.type';
import { environment } from '../../../environments/environment';
import { catchError, combineLatest, filter, Subject, switchMap, tap, throwError } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getWeekRange, TDate } from '../../lib';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class WeekCalendarService {

  constructor() {

  }

  private api = inject(ApiService)

  private url = environment.ibob

  calendar = inject(NgbCalendar);
  selectedDate = signal<NgbDate>(this.calendar.getToday())
  dateRange = computed(() => {
    const date = this.selectedDate()
    return getWeekRange(date)
  })

  private isoStart = computed(() => {
    const { start } = this.dateRange()
    return this.dateToIso(start)
  })

  private isoEnd = computed(() => {
    const { end } = this.dateRange()
    return this.dateToIso(end)
  })


  private startDate$ = toObservable(this.isoStart)

  private endDate$ = toObservable(this.isoEnd)

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

  setDoor = (doors: TAppDoor[]) => {
    console.log('set door')
    const selectedDoor = doors.flatMap(({ check, doorId }) => check ? [doorId] : [])
    this.doors$.next(selectedDoor)
  }


}

type TRawDate = { start: TDate | null; end: TDate | null }