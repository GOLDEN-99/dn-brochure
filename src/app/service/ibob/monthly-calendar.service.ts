import { computed, inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { combineLatest, concat, Subject, switchMap } from 'rxjs';
import { TAppDoor, TMonthlyReq, TMonthlyRes } from '../../types/ibob-supplier.type';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class MonthlyCalendarService {

  constructor() { }

  private api = inject(ApiService)

  private url = environment.ibob

  private month$ = new Subject<number>()

  private year$ = new Subject<number>()

  private doors$ = new Subject<string[]>()

  setMonth = ({ year, month }: { year: number, month: number }) => {
    this.month$.next(month)
    this.year$.next(year)
  }

  setDoor = (doors: TAppDoor[]) => {
    const selectedDoor = doors.flatMap(({ check, doorId }) => check ? [doorId] : [])
    this.doors$.next(selectedDoor)
  }

  private getMonthlyResevation = ({ month, year, door }: TMonthlyReq) => this.api.post<TMonthlyRes[]>(`${this.url}/GetMonthlyReservationStatus`, door, { params: { month, year } })

  private params$ = combineLatest({
    month: this.month$,
    year: this.year$,
    door: this.doors$
  })

  private result$ = this.params$.pipe(switchMap(this.getMonthlyResevation))

  reservation = toSignal(this.result$, { initialValue: [] })

  fullCalendar = computed(() => {
    const raw = this.reservation()
    const reserveDay = raw.length
    const fdom = raw[0]
    const ldom = raw[reserveDay - 1]
    if (!fdom || !ldom) return []
    const prev = this.genPrev(fdom.date)
    const prevLength = prev.length
    const next = this.genNext(ldom.date)
    const nextLength = next.length

    let month = []
    let week = []

    for (let i = 0; i < prevLength + reserveDay + nextLength; i++) {
      if (i < prevLength) {
        week.push(prev[i])
      } else if (i < prevLength + reserveDay) {
        week.push(raw[i - prevLength])
      } else {
        week.push(next[i - prevLength - reserveDay])
      }

      if (week.length === 7) {
        month.push(week)
        week = []
      }
    }

    return month
  })

  private genPrev = (iso: string): TMonthlyRes[] => {
    const firstDayOfMonth = new Date(iso);
    const lastDayOfPrevMonth = new Date(firstDayOfMonth);
    lastDayOfPrevMonth.setDate(0)
    const resultDates: string[] = [];

    let currentDate = new Date(lastDayOfPrevMonth);
    while (currentDate.getDay() !== 0) {
      resultDates.unshift(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() - 1)
      if (resultDates.length === 7) break
    }

    return resultDates.map((r) => ({ date: r, status: -1 }));
  }

  private genNext = (iso: string): TMonthlyRes[] => {

    const lastDayOfMonth = new Date(iso);
    const firstDayOfNextMonth = new Date(lastDayOfMonth);
    firstDayOfNextMonth.setDate(lastDayOfMonth.getDate() + 1);

    // Find the earliest Sunday in the next month (0 = Sunday, 1 = Monday, etc.)
    const firstSundayOfNextMonth = new Date(firstDayOfNextMonth);
    const dayOfWeek = firstDayOfNextMonth.getDay();

    if (dayOfWeek === 0) {
    } else {
      firstSundayOfNextMonth.setDate(firstDayOfNextMonth.getDate() + (7 - dayOfWeek));
    }

    const resultDates = [];

    const currentDate = new Date(firstDayOfNextMonth);

    while (currentDate <= firstSundayOfNextMonth) {
      resultDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return resultDates.map((r) => ({ date: r, status: -1 }))
  }
}
